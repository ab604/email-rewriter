async function rewriteEmail() {
    const inputEmail = document.getElementById('inputEmail').value;
    const outputEmail = document.getElementById('outputEmail');
    const rewriteBtn = document.getElementById('rewriteBtn');
    const loading = document.getElementById('loading');

    if (!inputEmail.trim()) {
        alert('Please enter an email to rewrite');
        return;
    }

    try {
        rewriteBtn.disabled = true;
        loading.style.display = 'block';
        outputEmail.value = '';

        const response = await fetch('api/rewrite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: inputEmail })
        });

        if (!response.ok) {
            throw new Error('Failed to rewrite email');
        }

        const data = await response.json();
        outputEmail.value = data.rewrittenEmail;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while rewriting the email');
    } finally {
        rewriteBtn.disabled = false;
        loading.style.display = 'none';
    }
}