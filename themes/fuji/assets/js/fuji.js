'use strict';

// get current theme
function getNowTheme() {
  let nowTheme = document.body.getAttribute('data-theme');
  if (nowTheme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    return nowTheme === 'dark' ? 'dark' : 'light';
  }
}

// load comment button only when comment area exist
if (document.querySelector('span.post-comment-notloaded')) {
  document.querySelector('span.post-comment-notloaded').addEventListener('click', loadComment);
}

// to-top button
document.querySelector('.btn .btn-scroll-top').addEventListener('click', () => {
  document.documentElement.scrollTop = 0;
});

document.addEventListener('DOMContentLoaded', () => {
  if (typeof mediumZoom === 'function') {
    mediumZoom('.img-zoomable', {
      margin: 32,
      background: '#00000054',
      scrollOffset: 128,
    });
  }
});

// update utterances theme
function updateUtterancesTheme(utterancesFrame) {
  let targetTheme = getNowTheme();
  if (utterancesFrame) {
    if (targetTheme === 'dark') {
      utterancesFrame.contentWindow.postMessage(
        {
          type: 'set-theme',
          theme: 'photon-dark',
        },
        'https://utteranc.es'
      );
    } else {
      utterancesFrame.contentWindow.postMessage(
        {
          type: 'set-theme',
          theme: 'github-light',
        },
        'https://utteranc.es'
      );
    }
  }
}

// search by fuse.js
function searchAll(key, index, counter) {
  let fuse = new Fuse(index, {
    shouldSort: true,
    distance: 10000,
    keys: [
      {
        name: 'title',
        weight: 2.0,
      },
      {
        name: 'tags',
        weight: 1.5,
      },
      {
        name: 'content',
        weight: 1.0,
      },
    ],
  });
  let result = fuse.search(key);
  // console.log(result);
  if (result.length > 0) {
    document.getElementById('search-result').innerHTML = template('search-result-template', result);
    return [new Date().getTime() - counter, result.length];
  } else {
    return 'notFound';
  }
}

let urlParams = new URLSearchParams(window.location.search); // get params from URL
if (urlParams.has('s')) {
  let counter = new Date().getTime();
  let infoElements = document.querySelectorAll('.search-result-info');
  let key = urlParams.get('s'); // get search keyword, divided by space
  document.querySelector('.search-input input').setAttribute('value', key);
  // get search index from json
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'index.json', true);
  xhr.responseType = 'json';
  xhr.onerror = () => {
    infoElements[2].removeAttribute('style');
  };
  xhr.ontimeout = () => {
    infoElements[2].removeAttribute('style');
  };
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // use index json to search
        // console.log(xhr.response);
        counter = searchAll(key, xhr.response, counter);
        // console.log(counter);
        if (counter === 'notFound') {
          infoElements[1].removeAttribute('style');
        } else {
          infoElements[0].innerHTML = infoElements[0].innerHTML.replace('[TIME]', counter[0]);
          infoElements[0].innerHTML = infoElements[0].innerHTML.replace('[NUM]', counter[1]);
          infoElements[0].removeAttribute('style');
        }
      } else {
        infoElements[2].removeAttribute('style');
      }
    }
  };
  xhr.send(null);
}

/* mobile menu  */
const openMenu = document.getElementById('btn-menu');
if (openMenu) {
  openMenu.addEventListener('click', () => {
    const menu = document.querySelector('.sidebar-mobile');
    if (menu) {
      if (menu.style.display === 'none') {
        menu.setAttribute('style', 'display: flex;');
      } else {
        menu.setAttribute('style', 'display: none;');
      }
    }
  });
}
