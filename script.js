const API_KEY = "e5c716e0a02a2f8d152be3722295f86a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const movieList = document.getElementById("movie-list");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");

let genreMap = {};

// 상영 중인 영화와 장르맵 로딩
window.addEventListener("DOMContentLoaded", async () => {
  genreMap = await getGenreMap();
  fetchNowMovies();
});

// 현재 상영 중인 영화
async function fetchNowMovies() {
  try {
    const res = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR`
    );
    const data = await res.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("인기 영화 불러오기 오류:", error);
  }
}

// 검색
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) {
    alert("검색어를 입력하세요.");
    return;
  }
  searchMovies(query);
});

async function searchMovies(query) {
  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(
        query
      )}`
    );
    const data = await res.json();
    displayMovies(data.results);
    history.pushState({ query }, "", `?query=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error("검색 오류:", error);
  }
}

// 뒤로가기/앞으로가기 처리
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.query) {
    input.value = e.state.query;
    searchMovies(e.state.query);
  } else {
    fetchNowMovies();
  }
});

// 영화 카드
function displayMovies(movies) {
  movieList.innerHTML = "";

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" />
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average}</p>
      <p class="movie-overview">${movie.overview}</p>
    `;

    card.addEventListener("click", () => {
      showModal(movie);
    });

    movieList.appendChild(card);
  });
}

// 모달 카드
function showModal(movie) {
  const genres =
    movie.genre_ids?.map((id) => genreMap[id]).join(", ") || "장르 정보 없음";

  modalContent.innerHTML = `
    <h2>${movie.title} (${movie.original_title})</h2>
    <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" />
    <p>개봉일 : ${movie.release_date}</p>
    <p>장르 : ${genres}</p>
    <p>평점 : ⭐ ${movie.vote_average}</p>
    <p>줄거리 : ${movie.overview || "줄거리 정보가 없습니다."}</p>
    <button onclick="closeModal()">닫기</button>
  `;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

// 장르맵
async function getGenreMap() {
  const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ko-KR`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const genreMap = {};
    data.genres.forEach((genre) => {
      genreMap[genre.id] = genre.name;
    });
    return genreMap;
  } catch (error) {
    console.error("장르 정보를 불러오는 데 실패했습니다:", error);
    return {};
  }
}
