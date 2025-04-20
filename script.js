document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const input = document.getElementById('fileInput');
  const files = input.files;
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  try {
    const res = await fetch('/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Server returned an error');
    }

    const data = await res.json();
    document.getElementById('result').textContent = data.feedback;
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('result').textContent = 'Failed to analyze images.';
  }
});
