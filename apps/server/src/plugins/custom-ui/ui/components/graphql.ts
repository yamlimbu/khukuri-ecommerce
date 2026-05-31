export async function fetchGraphQL(query: string, variables: any = {}) {
    const token = localStorage.getItem('vendure-auth-token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/admin-api', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    return result.data;
}
