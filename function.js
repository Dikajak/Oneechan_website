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
            
            // Initialize comments if not exist
            if (!post.comments) {
                post.comments = [];
            }

            const commentsHTML = post.comments.map(comment => `
                <div class="comment">
                    <strong>${comment.name}</strong>
                    <p>${comment.text}</p>
                    <small>${new Date(comment.date).toLocaleString('ja-JP')}</small>
                </div>
            `).join('');

            postDiv.innerHTML = `
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Uploaded image">` : ''}
                <div class="post-actions">
                    <button class="like-btn" data-index="${index}">❤️ ${post.likes}</button>
                    <button class="delete-btn" data-index="${index}">🗑️ 削除</button>
                </div>
                <div class="comments-section">
                    <h4>💬 コメント (${post.comments.length})</h4>
                    <div class="comments-list">${commentsHTML || '<p style="color: #999;">コメントはまだありません</p>'}</div>
                    <form class="comment-form" data-index="${index}">
                        <input type="text" class="comment-name" placeholder="名前" required>
                        <textarea class="comment-text" placeholder="コメントを入力..." required></textarea>
                        <button type="submit" class="submit-comment-btn">送信</button>
                    </form>
                </div>
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
        } else if (e.target.classList.contains('like-btn')) {
            const index = e.target.getAttribute('data-index');
            posts[index].likes += 1;
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            renderPosts();
        }
    });

    // Handle comment submission
    postsContainer.addEventListener('submit', function(e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            const form = e.target;
            const index = form.getAttribute('data-index');
            const name = form.querySelector('.comment-name').value.trim();
            const text = form.querySelector('.comment-text').value.trim();

            if (name && text) {
                if (!posts[index].comments) {
                    posts[index].comments = [];
                }
                posts[index].comments.push({
                    name: name,
                    text: text,
                    date: new Date().toISOString()
                });
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
        
        const post = { id: Date.now(), content: content || '', image: '', likes: 0 };
        
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