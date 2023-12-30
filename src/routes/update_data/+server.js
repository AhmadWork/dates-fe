import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function POST({ request }) {
  const { token, coins, dates } = await request.json();

      const response = await fetch('http://localhost:3999/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
            "coins":{
                "number": coins
            }, 
            "dates":{
                "number": dates
            }
     }),

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
  