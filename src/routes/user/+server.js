import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function GET({ request }) {
    const token = request.headers.get('x-auth-token');
    const db_url = import.meta.env.VITE_BACK_END_URL;

    // I need to get the server side header under this key x-auth-token
      const response = await fetch(`${db_url}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }});

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
 export async function POST({ request }) {
    const token = request.headers.get('x-auth-token');
    const db_url = import.meta.env.VITE_BACK_END_URL;

    // I need to get the server side header under this key x-auth-token
      const response = await fetch(`${db_url}/api/users/update_overtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }});

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


