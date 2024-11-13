async function rewriteEmail() {
    const inputEmail = document.getElementById('inputEmail').value;
    const outputEmail = document.getElementById('outputEmail');
    const rewriteBtn = document.getElementById('rewriteBtn');
    const loading = document.getElementById('loading');
    const toneSel = document.getElementById('toneSelect').value;

    if (!inputEmail.trim()) {
        alert('Please enter an email to rewrite');
        return;
    }

    try {
        rewriteBtn.disabled = true;
        loading.style.display = 'block';
        outputEmail.value = '';

        // Log the request for debugging
        console.log('Sending request to worker...');
        
        const response = await fetch('https://email-rewriter.ab60454.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: inputEmail , 
                tone: toneSel 
            })
        });

        // Log the response status
        console.log('Response status:', response.status);

        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Failed to parse JSON response: ' + responseText);
        }

        if (!data.rewrittenEmail) {
            throw new Error('No rewritten email in response');
        }

        outputEmail.value = data.rewrittenEmail;
    } catch (error) {
        console.error('Detailed error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        rewriteBtn.disabled = false;
        loading.style.display = 'none';
    }
}