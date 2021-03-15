import { _ } from "../utils/selector.js";
import request from "../utils/request.js";
import { urls } from "../utils/urls.js";
import { times } from "../utils/states.js";
import Keyword from "./keyword.js";

export default function RecommItems(keywordState, rollings) {
  const { searchingInput, recommWordsToggle, recommendations } = keywordState;
  const { rollingKeywordHtml } = rollings;
  Keyword.call(this, searchingInput, rollingKeywordHtml);
  this.currElement = null;
  this.coloredElement = null;
  this.recommWordsToggle = recommWordsToggle;
  this.recommendations = recommendations;
  this.isOutOfToggle = false;
  this.recentKeywords = []; // 최근검색어
  this.recentKeywordsTemplate = null;
}

RecommItems.prototype = Object.create(Keyword.prototype);

RecommItems.prototype.init = async function (className, title) {
  this.popularWords = await this.getTopten();
  this.topTenWords = this.createTemplate(this.popularWords, className, title);
  this.recommWordsToggle.innerHTML = this.topTenWords;
};

RecommItems.prototype.createTemplate = function (array, className, title) {
  const mid = Math.floor(array.length / 2);
  const template = (className, num, item) => `<li class="${className}__item" data-id="${num}"><span class="item__rank">${num}</span><span class="item__word">${item}</span></li>`;
  return (
    `<div class="${className}"><span class="${className}__title">${title}</span><div class="${className}__list">` +
    array.reduce((acc, item, i) => {
      acc += i < mid || i > mid ? template(className, i + 1, item) : `</ul><ul class="${className}__batch">` + template(className, i + 1, item);
      return acc;
    }, `<ul class="${className}__batch">`) +
    `</ul></div></div>`
  );
};

RecommItems.prototype.registerEvent = function () {
  this.searchingInput.addEventListener("focusin", this.focusinEvent.bind(this));
  this.searchingInput.addEventListener("focusout", this.focusoutEvent.bind(this));
  this.searchingInput.addEventListener("input", this.inputEvent.bind(this));
  this.searchingInput.addEventListener("keydown", this.keydownEvent.bind(this));
  this.init("popularWords", "인기 쇼핑 키워드");
};

// RecommItems.prototype.registerEvent = async function () {
//   await this.init("popularWords", "인기 쇼핑 키워드");
//   this.searchingInput.addEventListener("focusin", this.focusinEvent.bind(this));
//   this.searchingInput.addEventListener("focusout", this.focusoutEvent.bind(this));
//   this.searchingInput.addEventListener("input", this.inputEvent.bind(this));
//   this.searchingInput.addEventListener("keydown", this.keydownEvent.bind(this));
// };

RecommItems.prototype.keydownEvent = function (e) {
  const { key, target } = e;
  if (this.isOutOfToggle) return;
  if (!this.recommWordsToggle.classList.contains("visible")) {
    this.recommWordsToggle.classList.add("visible");
  }
  if (key === "Enter") {
    if (this.recentKeywords.every((e) => e !== target.value)) this.recentKeywords.push(target.value);
  }
  if (key === "ArrowUp") {
    e.preventDefault();
    this.moveUp();
    e.target.value = this.currElement.innerText;
  }
  if (key === "ArrowDown") {
    e.preventDefault();
    this.moveDown();
    e.target.value = this.currElement.innerText;
  }
};

RecommItems.prototype.moveUp = function () {
  if (this.currIndex > 0) {
    this.currIndex--;
    this.colorOn();
  } else if (this.currIndex - 1 < 0) {
    this.toggle();
    this.colorOff();
    this.isOutOfToggle = true;
  }
};

RecommItems.prototype.moveDown = function () {
  if (this.currIndex + 1 < this.recommendations.length) {
    this.currIndex++;
    this.colorOn();
  } else if (this.currIndex === this.recommendations.length - 1) {
    this.toggle();
    this.colorOff();
    this.currIndex--;
    this.isOutOfToggle = true;
  }
};

RecommItems.prototype.colorOn = function () {
  this.currElement = _.$All(".recommended__item")[this.currIndex];
  if (this.coloredElement) {
    this.coloredElement.classList.remove("colorGray");
    this.coloredElement.classList.add("colorBlack");
  }
  this.currElement.classList.add("colorGray");
  this.coloredElement = this.currElement;
};

RecommItems.prototype.colorOff = function () {
  if (!this.coloredElement) return;
  this.coloredElement.classList.remove("colorGray");
  this.coloredElement.classList.add("colorBlack");
  this.coloredElement = null;
  this.currElement = null;
};

RecommItems.prototype.focusinEvent = function () {
  this.recommWordsToggle.innerHTML = this.recentKeywordsTemplate ? this.recentKeywordsTemplate : this.topTenWords;
  this.rollingKeywordHtml.classList.add("none");
  this.recommWordsToggle.classList.add("visible");
};

RecommItems.prototype.focusoutEvent = function ({ target }) {
  if (target.value) target.value = ``;
  this.recommWordsToggle.innerHTML = ``;
  this.rollingKeywordHtml.classList.remove("none");
  this.recommWordsToggle.classList.remove("visible");
};

RecommItems.prototype.toggle = function () {
  this.recommWordsToggle.classList.toggle("visible");
};

RecommItems.prototype.resetTimer = function () {
  if (this.timer) clearTimeout(this.timer);
};

RecommItems.prototype.loadRelatedWords = async function (inputValue) {
  const data = await request(urls.recommendedWords, inputValue);
  const dataSet = parseData(data);
  const templateRecommendations =
    `<div class="recommended">` +
    dataSet.reduce((acc, item, i) => {
      const highlightOnItem = item.replace(inputValue, `<span class="highlight">${inputValue}</span>`);
      acc += `<span class="recommended__item" data-id="${i}">${highlightOnItem}</span>`;
      return acc;
    }, ``) +
    `</div>`;
  this.recommWordsToggle.innerHTML = templateRecommendations;
  this.recommendations = dataSet;
  this.recommWordsToggle.classList.add("visible");
};

RecommItems.prototype.resetToggleStatus = function () {
  this.currIndex = -1;
  this.isOutOfToggle = false;
};

RecommItems.prototype.inputEvent = function (e) {
  this.resetToggleStatus();
  const inputValue = e.target.value;
  this.resetTimer();
  if (inputValue === ``) {
    if (this.recentKeywords.length) {
      this.recentKeywordsTemplate = this.createTemplate(this.recentKeywords, "recentKeywords", "최근 검색어");
      this.recommWordsToggle.innerHTML = this.recentKeywordsTemplate;
    } else {
      this.recommWordsToggle.innerHTML = this.topTenWords;
    }
  }
  if (inputValue !== ``) {
    // loading 추가?
    this.timer = setTimeout((_) => this.loadRelatedWords(inputValue), times.debounce);
  }
};

function parseData(data) {
  const { suggestions } = data;
  const tempSuggestions = suggestions.map((item) => item.value.normalize("NFC"));
  const set = [...new Set(tempSuggestions)]; // 중복값 제거
  return set;
}
