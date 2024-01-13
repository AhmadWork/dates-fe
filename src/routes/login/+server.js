import { json } from '@sveltejs/kit';

// @ts-nocheck
export async function POST({ request }) {
  const { email, password } = await request.json();
  const db_url = import.meta.env.VITE_BACK_END_URL;

  const response = await fetch(`${db_url}/api/users/login`, {
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
  