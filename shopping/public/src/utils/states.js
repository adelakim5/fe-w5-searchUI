const partnerState = {
  openMarket: "오픈마켓",
  departmentStore: "백화점",
  homeShopping: "홈쇼핑",
  mart: "마트/생활",
  social: "소셜",
  fashion: "패션",
  leisure: "레저/취미",
  book: "도서/공연",
};

const carouselState = {
  slideList: null,
  currIndex: 0,
  currSlide: null,
  currDot: null,
  slidePagination: null,
  pageDots: null,
};

const longClickState = {
  isPressed: false,
  timer: {
    next: null,
    prev: null,
  },
  isMoved: {
    next: false,
    prev: false,
  },
};

const times = {
  debounce: 1000,
  rolling: 2000,
  quickRolling: 0,
  transition: 500,
  transform: 22,
  init: 0,
};

const keywordState = {
  searchingInput: null,
  recommWordsToggle: null,
  recommendations: [],
};

const rollings = {
  rollingContainer: null,
  rollingKeywordHtml: null,
};

export { carouselState, longClickState, partnerState, times, keywordState, rollings };
