import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function POST({ request }) {
  const { name, email, password, dates } = await request.json();
  console.log(name, email, password, dates)

      const response = await fetch('http://localhost:3999/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, dates }),

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
  