import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function POST({ request }) {
  const { email, password } = await request.json();
  console.log(email, password )


      const response = await fetch('http://localhost:3999/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),

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
  