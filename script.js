const API_KEY = "f0c422943c214092a8c58d54950f23ed";
const url = "https://newsapi.org/v2/everything?q=";

const spinner = document.getElementById("spinner");
const cardsContainer = document.getElementById("cards-container");

let savedArticles = JSON.parse(localStorage.getItem("savedArticles")) || [];

window.addEventListener("load", () => {
    fetchNews("all");
    fetchTrendingNews();
    const allNavItem = document.getElementById('all');
    curSelectedNav = allNavItem;
});

async function fetchNews(query) {
    spinner.style.display = "flex";
    cardsContainer.innerHTML = "";
    try {
        let fetchUrl;
        if (query.toLowerCase() === 'all') {
            fetchUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
        } else {
            fetchUrl = `${url}${query}&apiKey=${API_KEY}`;
        }
        const res = await fetch(fetchUrl);
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        cardsContainer.innerHTML = "<h2>Something went wrong. Please try again.</h2>";
    }
    spinner.style.display = "none";
}

function bindData(articles) {
    const newsCardTemplate = document.getElementById("template-news-card");
    cardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        const message = curSelectedNav && curSelectedNav.id === 'saved-articles' 
            ? "You have no saved articles."
            : "No articles found. Please try another search.";
        cardsContainer.innerHTML = `<h2>${message}</h2>`;
        return;
    }

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", (e) => {
        if (!e.target.closest('.social-share') && !e.target.closest('.bookmark-icon')) {
            window.open(article.url, "_blank");
        }
    });

    // Social Share
    const twitterShare = cardClone.querySelector(".twitter");
    const facebookShare = cardClone.querySelector(".facebook");
    const linkedinShare = cardClone.querySelector(".linkedin");
    const encodedUrl = encodeURIComponent(article.url);
    const encodedTitle = encodeURIComponent(article.title);
    twitterShare.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    linkedinShare.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
    cardClone.querySelectorAll('.share-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(icon.href, 'Share', 'width=600,height=400');
        });
    });

    // Bookmark
    const bookmarkIcon = cardClone.querySelector(".bookmark-icon");
    if (savedArticles.some(saved => saved.url === article.url)) {
        bookmarkIcon.classList.add('saved');
    }

    bookmarkIcon.addEventListener('click', () => {
        const isSaved = savedArticles.some(saved => saved.url === article.url);
        if (isSaved) {
            savedArticles = savedArticles.filter(saved => saved.url !== article.url);
            bookmarkIcon.classList.remove('saved');
        } else {
            savedArticles.push(article);
            bookmarkIcon.classList.add('saved');
        }
        localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
    });
}

async function fetchTrendingNews() {
    try {
        const fetchUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${API_KEY}`;
        const res = await fetch(fetchUrl);
        const data = await res.json();
        bindTrendingData(data.articles);
    } catch (error) {
        console.error("Error fetching trending news:", error);
    }
}

function bindTrendingData(articles) {
    const trendingCardsContainer = document.getElementById("trending-news-cards");
    const trendingCardTemplate = document.getElementById("template-trending-card");
    trendingCardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        return;
    }

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = trendingCardTemplate.content.cloneNode(true);
        fillDataInTrendingCard(cardClone, article);
        trendingCardsContainer.appendChild(cardClone);
    });
}

function fillDataInTrendingCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#trending-news-img");
    const newsTitle = cardClone.querySelector("#trending-news-title");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    if (id === 'saved-articles') {
        spinner.style.display = 'flex';
        bindData(savedArticles);
        spinner.style.display = 'none';
    } else {
        fetchNews(id);
    }
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});



// Back to Top button
const backToTopBtn = document.getElementById("back-to-top-btn");

window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Theme Switcher
const themeToggle = document.getElementById("theme-toggle");

function setDarkTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark-theme");
        themeToggle.checked = true;
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark-theme");
        themeToggle.checked = false;
        localStorage.setItem("theme", "light");
    }
}

themeToggle.addEventListener("change", () => {
    setDarkTheme(themeToggle.checked);
});

// Check for saved theme preference on load
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setDarkTheme(true);
    }
});
