import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function POST({ request }) {
    const token = request.headers.get('x-auth-token');

    const response = await fetch('http://localhost:3999/api/tree/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token

        },
        body: JSON.stringify({ dpm:3, growth:"Adult" }),

      });
  
      const data = await response.json();
  
      if (response.ok) {
        return json({ 
          status: 200,
          body: data,
        });
      } else {
        return json( {
          status: response.status,
          body: data,
        });
      }
  }
  