import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function GET({ request }) {
    const token = request.headers.get('x-auth-token');
    // I need to get the server side header under this key x-auth-token
      const response = await fetch('http://localhost:3999/api/users', {
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
    // I need to get the server side header under this key x-auth-token
      const response = await fetch('http://localhost:3999/api/users/update_overtime', {
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


