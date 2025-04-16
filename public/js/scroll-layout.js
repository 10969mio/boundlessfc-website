// スクロールに応じてレイアウトを変更するスクリプト
document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const scrollNavbar = document.getElementById('scrollNavbar');
  const navbar = document.getElementById('Navbar');
  const body = document.body;
  const newsSection = document.querySelector('.news-slider');
  const sidebar = document.querySelector('.sidebar-container');
  const headerMenu = document.querySelector('.header-menu');
  const socialMenu = document.querySelector('.social-menu');
  
  // スクロールナビバーを初期状態で非表示に設定
  if (scrollNavbar) {
    scrollNavbar.classList.remove('visible');
    // CSSの初期状態を確保（top: -100pxなど）
    scrollNavbar.style.top = '-100px';
  }
  
  // 全てのナビゲーションバーに対してオフキャンバス制御を適用する関数
  function setupAllNavbars() {
    // オフキャンバスメニュー関連の要素
    const offcanvasNavbar = document.getElementById('offcanvasNavbar');
    
    // 全てのハンバーガーメニューボタンを取得
    const navbarTogglers = document.querySelectorAll('.navbar-toggler');
    
    if (offcanvasNavbar && navbarTogglers.length > 0) {
      // Bootstrap オフキャンバスのインスタンスを取得または初期化
      let offcanvasInstance;
      try {
        offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasNavbar);
        if (!offcanvasInstance) {
          offcanvasInstance = new bootstrap.Offcanvas(offcanvasNavbar);
        }
      } catch (e) {
        console.error('Bootstrapのオフキャンバス初期化に失敗しました:', e);
      }
      
      // ページ読み込み時に確実に閉じる
      offcanvasNavbar.classList.remove('show');
      document.querySelector('.offcanvas-backdrop')?.remove();
      
      // 全てのトグラーに対してイベントを設定
      navbarTogglers.forEach(toggler => {
        toggler.addEventListener('click', function(e) {
          // データ属性がない場合のフォールバック
          if (!toggler.hasAttribute('data-bs-toggle') || 
              !toggler.hasAttribute('data-bs-target')) {
            e.preventDefault();
            if (offcanvasInstance) {
              offcanvasInstance.toggle();
            }
          }
        });
      });
      
      // オフキャンバス開閉状態に応じて全てのハンバーガーアイコンの表示/非表示を制御
      offcanvasNavbar.addEventListener('shown.bs.offcanvas', function() {
        navbarTogglers.forEach(toggler => {
          toggler.style.opacity = '0';
          toggler.style.visibility = 'hidden';
          toggler.style.pointerEvents = 'none';
        });
      });
      
      offcanvasNavbar.addEventListener('hidden.bs.offcanvas', function() {
        navbarTogglers.forEach(toggler => {
          toggler.style.opacity = '1';
          toggler.style.visibility = 'visible';
          toggler.style.pointerEvents = 'auto';
        });
      });
      
      // オフキャンバスの外をクリックしたときに閉じる
      document.addEventListener('click', function(e) {
        if (offcanvasNavbar.classList.contains('show') && 
            !offcanvasNavbar.contains(e.target) && 
            !Array.from(navbarTogglers).some(toggler => toggler.contains(e.target))) {
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        }
      });
      
      // オフキャンバスメニュー内の項目クリック時にメニューを閉じる
      const offcanvasMenuItems = offcanvasNavbar.querySelectorAll('.nav-link.sidemenu-item');
      offcanvasMenuItems.forEach(item => {
        item.addEventListener('click', function() {
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        });
      });
    }
  }
  
  // オフキャンバス制御を適用
  setupAllNavbars();
  
  // ニュースセクションの位置を取得
  function getNewsSectionPosition() {
    if (newsSection) {
      return newsSection.getBoundingClientRect().top + window.scrollY;
    }
    return 800; // デフォルト値（ニュースセクションがない場合）
  }
  
  let newsSectionPosition = getNewsSectionPosition();
  
  // レスポンシブ対応のメディアクエリチェック
  function isMobileView() {
    return window.matchMedia('(max-width: 992px)').matches;
  }
  
  // 背景要素を取得（クラス名は実際の要素に合わせて調整が必要）
  const backgroundElements = document.querySelectorAll('.bg-image, .background-container, .hero-bg, #background');
  
  // 要素の表示/非表示を設定
  function updateElementsVisibility(isScrolled) {
    // 背景要素を常に表示
    backgroundElements.forEach(element => {
      if (element) {
        element.style.display = '';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      }
    });
    
    // スクロールナビゲーションのスタイル
    if (isScrolled) {
      if (scrollNavbar) scrollNavbar.classList.add('visible');
    } else {
      if (scrollNavbar) scrollNavbar.classList.remove('visible');
    }
    
    // モバイル表示かどうかをチェック
    const isMobile = isMobileView();
    
    if (isMobile) {
      // モバイル表示の場合、サイドバーとメニューを常に非表示
      if (sidebar) sidebar.style.display = 'none';
      if (headerMenu) headerMenu.style.display = 'none';
      if (socialMenu) socialMenu.style.display = 'none';
      
      // モバイル表示（992px以下）では常にスクロールナビゲーションを表示
      if (scrollNavbar) {
        scrollNavbar.classList.add('visible');
        scrollNavbar.style.top = '0';
      }
      body.classList.add('scrolled');
      // 直接背景色を設定
      document.body.style.backgroundColor = '#000000';
    } else {
      // デスクトップ表示の場合、スクロール状態に応じて表示/非表示
      if (isScrolled) {
        body.classList.add('scrolled');
        // 直接背景色を設定
        document.body.style.backgroundColor = '#000000';
        // スクロールされたときは非表示（背景以外）
        if (sidebar) sidebar.style.opacity = '0';
        if (headerMenu) headerMenu.style.opacity = '0';
        if (socialMenu) socialMenu.style.opacity = '0';
      } else {
        body.classList.remove('scrolled');
        // 背景色をリセット
        document.body.style.backgroundColor = '';
        // スクロールがトップに戻ったときは表示
        if (sidebar) {
          sidebar.style.display = '';
          sidebar.style.opacity = '1';
          sidebar.style.visibility = 'visible';
          sidebar.style.position = 'fixed';
          sidebar.style.left = '0';
        }
        if (headerMenu) {
          headerMenu.style.display = '';
          headerMenu.style.opacity = '1';
        }
        if (socialMenu) {
          socialMenu.style.display = '';
          socialMenu.style.opacity = '1';
        }
      }
      
      // デスクトップ表示時にオフキャンバスが開いていれば閉じる
      const offcanvasNavbar = document.getElementById('offcanvasNavbar');
      if (offcanvasNavbar && offcanvasNavbar.classList.contains('show')) {
        try {
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasNavbar);
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        } catch (e) {
          console.error('オフキャンバスを閉じる際にエラーが発生しました:', e);
          // フォールバック: クラスを直接操作
          offcanvasNavbar.classList.remove('show');
          document.querySelector('.offcanvas-backdrop')?.remove();
        }
      }
    }
  }
  
  // スクロールイベントのリスナー
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // ニュースセクションに達したかチェック
    const isScrolled = scrollPosition >= newsSectionPosition - 500;
    
    // 要素の表示状態を更新
    updateElementsVisibility(isScrolled);
  });
  
  // 初期状態の設定
  updateElementsVisibility(window.scrollY >= newsSectionPosition - 500);
  
  // ウィンドウサイズ変更時にニュースセクションの位置を再計算
  window.addEventListener('resize', function() {
    const newPosition = getNewsSectionPosition();
    if (newPosition !== newsSectionPosition) {
      newsSectionPosition = newPosition;
    }
    
    // リサイズ時にも要素の表示状態を更新
    updateElementsVisibility(window.scrollY >= newsSectionPosition - 500);
    
    // 背景要素を明示的に表示
    backgroundElements.forEach(element => {
      if (element) {
        element.style.display = '';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      }
    });
  });
});

// ナビゲーション表示制御スクリプト
document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const scrollNavbar = document.getElementById('scrollNavbar');
  const mainNavbar = document.getElementById('mainNavbar');
  const navbar = document.getElementById('Navbar');
  const body = document.body;
  const newsSection = document.querySelector('.news-slider');
  
  // オフキャンバスメニューとハンバーガーメニューの再設定（リロード対策）
  const offcanvasNavbar = document.getElementById('offcanvasNavbar');
  const navbarTogglers = document.querySelectorAll('.navbar-toggler');
  
  if (offcanvasNavbar && navbarTogglers.length > 0) {
    // オフキャンバスの状態を確認して、トグラーの表示状態を設定
    if (offcanvasNavbar.classList.contains('show')) {
      navbarTogglers.forEach(toggler => {
        toggler.style.opacity = '0';
        toggler.style.visibility = 'hidden';
        toggler.style.pointerEvents = 'none';
      });
    } else {
      navbarTogglers.forEach(toggler => {
        toggler.style.opacity = '1';
        toggler.style.visibility = 'visible';
        toggler.style.pointerEvents = 'auto';
      });
    }
  }
  
  // 背景要素を取得（クラス名は実際の要素に合わせて調整が必要）
  const backgroundElements = document.querySelectorAll('.bg-image, .background-container, .hero-bg, #background');
  
  // 背景要素を常に表示
  backgroundElements.forEach(element => {
    if (element) {
      element.style.display = '';
      element.style.opacity = '1';
      element.style.visibility = 'visible';
    }
  });
  
  // ニュースセクションの位置を取得
  function getNewsSectionPosition() {
    if (newsSection) {
      return newsSection.getBoundingClientRect().top + window.scrollY;
    }
    return 800; // デフォルト値
  }
  
  let newsSectionPosition = getNewsSectionPosition();
  
  // レスポンシブ対応判定
  function isMobileView() {
    return window.matchMedia('(max-width: 992px)').matches;
  }
  
  // スクロールイベント処理
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    const isMobile = isMobileView();
    
    // 背景要素を常に表示
    backgroundElements.forEach(element => {
      if (element) {
        element.style.display = '';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      }
    });
    
    // ニュースセクションに達したか確認
    const isScrolled = scrollPosition >= newsSectionPosition - 500;
    
    // スクロール状態に応じて背景色を変更
    if (isScrolled) {
      body.classList.add('scrolled');
      // 直接背景色を設定
      document.body.style.backgroundColor = '#000000';
    } else {
      body.classList.remove('scrolled');
      // 背景色をリセット
      document.body.style.backgroundColor = '';
    }
    
    if (isMobile) {
      // モバイル表示（992px以下）では常にスクロールナビゲーション表示
      if (scrollNavbar) {
        scrollNavbar.classList.add('visible');
        scrollNavbar.style.top = '0';
      }
      
      // モバイル表示では常に背景を黒に
      document.body.style.backgroundColor = '#000000';
      
      if (mainNavbar) mainNavbar.style.display = 'none';
    } else {
      // PC表示：スクロール位置に応じてナビゲーション切替
      if (isScrolled) {
        // スクロール時はスクロールナビゲーション表示
        if (scrollNavbar) {
          scrollNavbar.classList.add('visible');
          scrollNavbar.style.top = '0';
        }
        body.classList.add('scrolled');
      } else {
        // 上部では通常ナビゲーション表示
        if (scrollNavbar) {
          scrollNavbar.classList.remove('visible');
          scrollNavbar.style.top = '-100px';
        }
        body.classList.remove('scrolled');
        if (mainNavbar) {
          mainNavbar.style.display = 'block';
          mainNavbar.style.visibility = 'visible';
        }
      }
    }
    
    // スクロール中にオフキャンバスメニューが表示されていたら閉じる（デスクトップ表示時）
    if (!isMobile) {
      const offcanvasNavbar = document.getElementById('offcanvasNavbar');
      if (offcanvasNavbar && offcanvasNavbar.classList.contains('show')) {
        try {
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasNavbar);
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        } catch (e) {
          // フォールバック: クラスを直接操作
          offcanvasNavbar.classList.remove('show');
          document.querySelector('.offcanvas-backdrop')?.remove();
        }
      }
    }
  });
  
  // 初期状態設定
  const initialIsScrolled = window.scrollY >= newsSectionPosition - 500;
  if (initialIsScrolled) {
    body.classList.add('scrolled');
    document.body.style.backgroundColor = '#000000';
  } else {
    body.classList.remove('scrolled');
    document.body.style.backgroundColor = '';
  }
  
  window.dispatchEvent(new Event('scroll'));
  
  // リサイズ時の処理
  window.addEventListener('resize', function() {
    newsSectionPosition = getNewsSectionPosition();
    
    // 背景要素を明示的に表示
    backgroundElements.forEach(element => {
      if (element) {
        element.style.display = '';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      }
    });
    
    window.dispatchEvent(new Event('scroll'));
  });
});






