(function() {
  //Get all galleries
  var galleriesSlider = document.getElementsByClassName("gallerySlideContainer");//need .gallerySlideContainer on .galleryContainer 

  //if no galleries -> quit
  if(galleriesSlider.length == 0){
    return;
  }
  
  //user last interaction position
  var lastDragPositionX = null;
  
  //event on each gallery
  for(var i = 0; i < galleriesSlider.length; i++){
    let galleryContainer = galleriesSlider[i];
    let galleryContent = galleriesSlider[i].getElementsByClassName("galleryContent")[0];
        
    //NAVIGATION BTN
    let btnPrev = galleriesSlider[i].getElementsByClassName("prev")[0];
    let btnNext = galleriesSlider[i].getElementsByClassName("next")[0];

    btnPrev.onclick = function(){    
      BTNnavigation(1, galleryContainer, galleryContent);
    };

    btnNext.onclick = function(){
      BTNnavigation(-1, galleryContainer, galleryContent);
    };

    //SLIDE MOBILE
    galleryContent.addEventListener("touchstart", function(eStart){
      var evt = (typeof eStart.originalEvent === 'undefined') ? eStart : eStart.originalEvent;
      var touch = evt.touches[0] || evt.changedTouches[0];
      //position
      lastDragPositionX = touch.pageX;
      //reset
      lastDistanceDrag = 0;

      this.galleryContainer = galleryContainer;//param to get in function event (JavaScript is a prototype-oriented language, remember!)
      this.addEventListener("touchmove", TOUCHhandlDragMove);
      this.addEventListener("touchend", TOUCHhandlDragEnd);
          
    }, false);

    //SLIDE MOUSE
    galleryContent.addEventListener("mousedown", function(e){
      //position
      lastDragPositionX = e.pageX;
      //reset
      lastDistanceDrag = 0;
      //cancel html default (drag img, text select etc.)
      e.preventDefault();
      //cursor grab
      galleryContent.classList.add("isGrabbing");

      this.galleryContainer = galleryContainer;
      this.addEventListener("mousemove", MOUSEhandlDragMove);
      this.addEventListener("mouseup", MOUSEhandlDragEnd);
    });
  }
  
  /* --- FUNCTIONS -- */
  //NAV BTN
  function BTNnavigation(direction, galleryContainer, galleryContent){
    let distance = galleryContainer.getBoundingClientRect().width;
    let translateGall_X = calcNewTranslate( distance * direction, galleryContainer, galleryContent);

    //stop drag tactile inertia
    isTimeToInertia = false;

    //need transition
    galleryContainer.classList.remove("noTransition");
    slideGallery(galleryContent, translateGall_X);
  }

  //DRAG
  function DragMove(userX, galleryContainer, galleryContent){
    //stop drag inertia
    isTimeToInertia = false;

    let distanceDrag = userX - lastDragPositionX;
    let translateGall_X = calcNewTranslate( distanceDrag, galleryContainer, galleryContent);

    lastDragPositionX = userX;
    lastDistanceDrag = distanceDrag;//for inertia

    //need to instant follow the interaction
    galleryContainer.classList.add("noTransition");

    slideGallery(galleryContent, translateGall_X);
  }

  function TOUCHhandlDragMove(e){
    //position
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
    let userX = touch.pageX;
    let userY = touch.pageY;
    let galleryContainer = e.currentTarget.galleryContainer;
    let parrentY = galleryContainer.getBoundingClientRect().top;
    let parrentHeight = galleryContainer.getBoundingClientRect().height;

    //outside top/bottom
    if(userY < parrentY || userY > parrentY + parrentHeight){
      this.removeEventListener("touchmove", TOUCHhandlDragMove);
      this.removeEventListener("touchend", TOUCHhandlDragEnd);
      return;
    }

    DragMove(userX, galleryContainer, this);
  }

  function MOUSEhandlDragMove(e){
    let userX = e.pageX;
    let userY = e.pageY;
    let galleryContainer = e.currentTarget.galleryContainer;
    let parrentY = galleryContainer.getBoundingClientRect().top;
    let parrentHeight = galleryContainer.getBoundingClientRect().height;

    //outside top/bottom
    if(userY < parrentY || userY > parrentY + parrentHeight){
      this.removeEventListener("mousemove", MOUSEhandlDragMove);
      this.removeEventListener("mouseup", MOUSEhandlDragEnd);
      //cursor grab
      this.classList.remove("isGrabbing");
      return;
    }

    DragMove(userX, galleryContainer, this);
  }

  //END DRAG
  function EndDrag(galleryContainer, galleryContent, boostDrag){
    isTimeToInertia = true;
    //cursor grab
    galleryContent.classList.remove("isGrabbing");

    dragDeceleration(lastDistanceDrag * boostDrag, galleryContainer, galleryContent);//boostDrag -> boost for start
  }
  
  function TOUCHhandlDragEnd(e){
    this.removeEventListener("touchmove", TOUCHhandlDragMove);
    this.removeEventListener("touchend", TOUCHhandlDragEnd);

    EndDrag(e.currentTarget.galleryContainer, this, 2);
  }

  function MOUSEhandlDragEnd(e){
    this.removeEventListener("mousemove", MOUSEhandlDragMove);
    this.removeEventListener("mouseup", MOUSEhandlDragEnd);

    EndDrag(e.currentTarget.galleryContainer, this, 5);
  }

  //DRAG DECELERATION
  var deceleration = 0.92;
  var timeTick = 1000;
  var isTimeToInertia = false;
  var lastDistanceDrag;

  function dragDeceleration(distanceDrag, galleryContainer, galleryContent){
    //cancel inertia
    if(!isTimeToInertia){ return; }

    distanceDrag = parseFloat((distanceDrag).toFixed(3));
    
    let translateGall_X = calcNewTranslate( distanceDrag, galleryContainer, galleryContent);

    slideGallery(galleryContent, translateGall_X);

    if(distanceDrag > 0){
      distanceDrag *= deceleration;
      if(distanceDrag <= 0.01){
        lastDragPositionX = null;
        isTimeToInertia = false;
      }
    }else{
      distanceDrag *= deceleration;
      if(distanceDrag >= -0.01){
        lastDragPositionX = null;
        isTimeToInertia = false;
      }
    }

    if(lastDragPositionX != null){
      setTimeout(dragDeceleration.bind(null, distanceDrag, galleryContainer, galleryContent), timeTick);
    }
  }
  
  //CALCUL TRANSLATE
  function calcNewTranslate( nextDistance, galleryContainer, galleryContent){
    //get actual transform (m41 is for tranformX)
    let actualTranslateX = new WebKitCSSMatrix(getComputedStyle(galleryContent).transform).m41;

    //go left
    if(nextDistance > 0){
      let limitLeftContent = galleryContent.getBoundingClientRect().left;
      let limitLeftContainer = galleryContainer.getBoundingClientRect().left;

      //fix limit begin slide
      if(limitLeftContent + nextDistance > limitLeftContainer){
          actualTranslateX = 0;
      }
      else{
          actualTranslateX += nextDistance;
      }
    }
    //go right
    else if(nextDistance < 0){
      let limitRightContent = galleryContent.getBoundingClientRect().right;
      let limitRightContainer = galleryContainer.getBoundingClientRect().right;

      //fix limit end slide
      if(limitRightContent + nextDistance < limitRightContainer){
          actualTranslateX = galleryContainer.getBoundingClientRect().width - galleryContent.getBoundingClientRect().width;
      }
      else{
          actualTranslateX += nextDistance;
      }
    }
        
    return actualTranslateX;
  }

  //SLIDE
  function slideGallery(galleryContent, translateGall_X){
    //calculated translate
    let transformCSS = "translateX(" + (translateGall_X) + "px)";
    //GO
    galleryContent.style.transform = transformCSS;
  }
})();

next.addEventListener('click', function() {
    var activeBlock = document.querySelector('.content > .block.active');
    var nextBlock = activeBlock.nextElementSibling;

    if (nextBlock.classList.contains('block')) {
        nextBlock.classList.add('active', 'fadeIn');
        nextBlock.style.display = 'flex';
        setTimeout(function () {
        nextBlock.classList.remove('fadeIn');
            nextBlock.style.opacity = '1';
        }, 500);
    }
    else {
        firstBlock.classList.add('active', 'fadeIn');
        firstBlock.style.display = 'flex';
        setTimeout(function () {
            firstBlock.classList.remove('fadeIn');
            firstBlock.style.opacity = '1';
        }, 500);
    }

    activeBlock.classList.add('fadeOut');
    setTimeout(function () {
        activeBlock.classList.remove('fadeOut');
        activeBlock.classList.remove('active');
        activeBlock.style.opacity = '0';
        activeBlock.style.display = 'none';
    }, 500);
});


