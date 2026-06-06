import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.origin + '/api');

// Simple callback storage for auth state changes
const authListeners: Array<(event: string, session: any) => void> = [];

// Helper to get headers with JWT token
function getHeaders() {
  const token = localStorage.getItem('agroveda_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Chainable thenable builder for intercepting database calls
class QueryBuilder {
  private table: string;
  private method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
  private body: any = null;
  private filters: Array<{ field: string; value: any }> = [];
  private orderVal: { field: string; ascending: boolean } | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields?: string) {
    if (this.method !== 'POST' && this.method !== 'PUT' && this.method !== 'DELETE') {
      this.method = 'GET';
    }
    return this;
  }

  insert(data: any) {
    this.method = 'POST';
    this.body = data;
    return this;
  }

  update(data: any) {
    this.method = 'PUT';
    this.body = data;
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    this.orderVal = { field, ascending: options ? options.ascending : true };
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Thenable implementation to support await/promise queries
  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      // Build query string
      let url = `${API_BASE_URL}/${this.table}`;
      const queryParams: string[] = [];

      this.filters.forEach(f => {
        queryParams.push(`${encodeURIComponent(f.field)}=${encodeURIComponent(f.value)}`);
      });

      if (this.orderVal) {
        queryParams.push(`order=${encodeURIComponent(this.orderVal.field)}`);
        queryParams.push(`asc=${this.orderVal.ascending}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const options: RequestInit = {
        method: this.method,
        headers: getHeaders(),
      };

      if (this.method === 'POST' || this.method === 'PUT') {
        options.body = JSON.stringify(this.body);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP error ${response.status}`);
      }

      let data = await response.json();

      // Handle modifiers
      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) ? (data[0] || null) : data;
        if (this.isSingle && !data) {
          throw new Error('No rows found');
        }
      }

      const result = { data, error: null };
      return onfulfilled ? onfulfilled(result) : result;
    } catch (err: any) {
      console.error(`Database query error [${this.table}]:`, err.message);
      const result = { data: null, error: { message: err.message } };
      return onrejected ? onrejected(result) : result;
    }
  }
}

export const supabase = {
  auth: {
    async getSession() {
      const token = localStorage.getItem('agroveda_token');
      if (!token) return { data: { session: null }, error: null };

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getHeaders(),
        });
        if (!response.ok) {
          localStorage.removeItem('agroveda_token');
          return { data: { session: null }, error: null };
        }
        const user = await response.json();
        return {
          data: {
            session: {
              access_token: token,
              user: {
                id: user.id,
                email: user.email,
                role: user.role,
              },
            },
          },
          error: null,
        };
      } catch (err: any) {
        return { data: { session: null }, error: { message: err.message } };
      }
    },

    async getUser() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          return { data: { user: null }, error: error || null };
        }
        return { data: { user: session.user }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('agroveda_token', data.session.access_token);
        
        // Notify listeners
        authListeners.forEach(cb => cb('SIGNED_IN', data.session));

        return {
          data: {
            user: data.user,
            session: data.session,
          },
          error: null,
        };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signUp({ email, password }: any) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Signup failed');
        }

        const data = await response.json();
        // Since backend logs the user in automatically, we store the token immediately
        localStorage.setItem('agroveda_token', data.session.access_token);
        
        // Notify listeners
        authListeners.forEach(cb => cb('SIGNED_IN', data.session));

        return {
          data: {
            user: data.user,
            session: data.session,
          },
          error: null,
        };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    async signOut() {
      localStorage.removeItem('agroveda_token');
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.push(callback);

      // Trigger immediately with current state
      supabase.auth.getSession().then(({ data: { session } }) => {
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      });

      return {
        data: {
          subscription: {
            unsubscribe() {
              const idx = authListeners.indexOf(callback);
              if (idx !== -1) authListeners.splice(idx, 1);
            },
          },
        },
      };
    },

    async resetPasswordForEmail(email: string) {
      console.log('Reset password requested for:', email);
      return { error: null };
    },

    async updateUser({ password }: any) {
      console.log('Update password requested');
      return { data: {}, error: null };
    },

    async exchangeCodeForSession(code: string) {
      console.log('exchangeCodeForSession called with code:', code);
      return { data: { session: null }, error: null };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  functions: {
    async invoke(functionName: string, options?: { body?: any; headers?: any }) {
      try {
        const response = await fetch(`${API_BASE_URL}/functions/${functionName}`, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            ...(options?.headers || {}),
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Edge function HTTP error ${response.status}`);
        }

        const data = await response.json();

        // If Razorpay simulation is active
        if (functionName === 'create-razorpay-order' && data.mock) {
          (window as any).Razorpay = class MockRazorpay {
            private opts: any;
            constructor(opts: any) {
              this.opts = opts;
            }
            open() {
              const modal = document.createElement('div');
              modal.style.position = 'fixed';
              modal.style.top = '0';
              modal.style.left = '0';
              modal.style.width = '100vw';
              modal.style.height = '100vh';
              modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
              modal.style.display = 'flex';
              modal.style.alignItems = 'center';
              modal.style.justifyContent = 'center';
              modal.style.zIndex = '99999';

              const content = document.createElement('div');
              content.style.backgroundColor = 'white';
              content.style.padding = '30px';
              content.style.borderRadius = '12px';
              content.style.maxWidth = '400px';
              content.style.width = '100%';
              content.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
              content.style.textAlign = 'center';
              content.style.fontFamily = 'sans-serif';

              const amountInRupees = (this.opts.amount / 100).toFixed(2);
              const upiLink = `upi://pay?pa=agroveda@upi&pn=AgroVeda&am=${amountInRupees}&cu=INR`;
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiLink)}`;

              content.innerHTML = `
                <h3 style="margin-top:0;color:#16a34a;font-size:20px;margin-bottom:5px;">Razorpay Demo Payment</h3>
                <p style="color:#666;font-size:12px;margin-bottom:15px;">Simulation for testing payment flow.</p>
                
                <div style="background:#f4f4f5;padding:10px;border-radius:8px;text-align:left;font-size:13px;margin-bottom:15px;">
                  <strong>Amount:</strong> ₹${amountInRupees}<br/>
                  <strong>Order ID:</strong> ${this.opts.order_id}
                </div>

                <div style="margin-bottom:20px;text-align:center;">
                  <img src="${qrImageUrl}" style="border: 2px solid #eaeaea; padding: 6px; border-radius: 8px; margin: 0 auto 8px auto; display: block; width: 140px; height: 140px;" alt="UPI QR Code"/>
                  <p style="font-size: 11px; color: #666; margin: 0;">Scan using any UPI App (GPay, PhonePe, Paytm)</p>
                  <p style="font-size: 10px; color: #999; margin: 2px 0 0 0;">(After scanning, click "Simulate Success" to place order)</p>
                </div>

                <button id="btn-pay-success" style="background:#16a34a;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:bold;margin-right:10px;font-size:14px;">Simulate Success</button>
                <button id="btn-pay-fail" style="background:#ef4444;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;">Simulate Failure</button>
              `;

              modal.appendChild(content);
              document.body.appendChild(modal);

              document.getElementById('btn-pay-success')?.addEventListener('click', () => {
                document.body.removeChild(modal);
                this.opts.handler({
                  razorpay_order_id: this.opts.order_id,
                  razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 11),
                  razorpay_signature: 'sig_mock_verified'
                });
              });

              document.getElementById('btn-pay-fail')?.addEventListener('click', () => {
                document.body.removeChild(modal);
                if (this.opts.modal && this.opts.opts?.modal?.ondismiss) {
                  this.opts.opts.modal.ondismiss();
                } else if (this.opts.modal && typeof this.opts.modal.ondismiss === 'function') {
                  this.opts.modal.ondismiss();
                } else {
                  toast.error("Payment cancelled");
                }
              });
            }
          };
        }

        return { data, error: null };
      } catch (err: any) {
        console.error(`Edge function error [${functionName}]:`, err.message);
        return { data: null, error: { message: err.message } };
      }
    }
  }
};