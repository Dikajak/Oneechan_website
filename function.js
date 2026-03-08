// Firebase config - replace with your Firebase project config
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const PASSWORD = 'admin'; // Change this to your desired password for posting and deleting

document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('posts-container');

    let posts = [];

    // Load existing posts from Firestore
    async function loadPosts() {
        const querySnapshot = await db.collection('posts').orderBy('id', 'desc').get();
        posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        renderPosts();
    }

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
                    <button class="like-btn" data-index="${index}">❤️ ${post.likes || 0}</button>
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

    // Initial load
    loadPosts();

    // Handle delete button clicks
    postsContainer.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            const enteredPassword = prompt('Enter password to delete:');
            if (enteredPassword === PASSWORD) {
                if (confirm('この投稿を削除してもいいですか？💔')) {
                    await db.collection('posts').doc(posts[index].id).delete();
                    loadPosts();
                }
            } else {
                alert('Incorrect password');
            }
        } else if (e.target.classList.contains('like-btn')) {
            const index = e.target.getAttribute('data-index');
            const postRef = db.collection('posts').doc(posts[index].id);
            await postRef.update({
                likes: (posts[index].likes || 0) + 1
            });
            loadPosts();
        }
    });

    // Handle comment submission
    postsContainer.addEventListener('submit', async function(e) {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            const form = e.target;
            const index = form.getAttribute('data-index');
            const name = form.querySelector('.comment-name').value.trim();
            const text = form.querySelector('.comment-text').value.trim();

            if (name && text) {
                const postRef = db.collection('posts').doc(posts[index].id);
                const updatedComments = [...(posts[index].comments || []), {
                    name: name,
                    text: text,
                    date: new Date().toISOString()
                }];
                await postRef.update({ comments: updatedComments });
                loadPosts();
            }
        }
    });

    // Handle form submission
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const content = document.getElementById('content').value.trim();
        const imageFile = document.getElementById('image').files[0];
        const password = document.getElementById('password').value;
        
        if (password !== PASSWORD) {
            alert('Incorrect password');
            return;
        }
        
        if (!content && !imageFile) {
            alert('内容を書くか画像を選んでね！💕');
            return;
        }
        
        const post = { id: Date.now(), content: content || '', image: '', likes: 0, comments: [] };
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                post.image = e.target.result;
                await db.collection('posts').add(post);
                loadPosts();
                postForm.reset();
            };
            reader.readAsDataURL(imageFile);
        } else {
            await db.collection('posts').add(post);
            loadPosts();
            postForm.reset();
        }
    });
});