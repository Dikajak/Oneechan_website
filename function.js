document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('posts-container');

    // Load existing posts from localStorage
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

    // Render all posts
    function renderPosts() {
        postsContainer.innerHTML = '';
        posts.forEach((post, index) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.innerHTML = `
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Uploaded image">` : ''}
                <button class="delete-btn" data-index="${index}">🗑️ 削除</button>
            `;
            postsContainer.appendChild(postDiv);
        });
    }

    // Initial render
    renderPosts();

    // Handle delete button clicks
    postsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('この投稿を削除してもいいですか？💔')) {
                posts.splice(index, 1);
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                renderPosts();
            }
        }
    });

    // Handle form submission
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = document.getElementById('content').value.trim();
        const imageFile = document.getElementById('image').files[0];
        
        if (!content && !imageFile) {
            alert('内容を書くか画像を選んでね！💕');
            return;
        }
        
        const post = { content: content || '', image: '' };
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                post.image = e.target.result;
                posts.unshift(post); // Add to beginning
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                renderPosts();
                postForm.reset();
            };
            reader.readAsDataURL(imageFile);
        } else {
            posts.unshift(post);
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            renderPosts();
            postForm.reset();
        }
    });
});