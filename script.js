document.addEventListener("DOMContentLoaded", function () {
    var select = function (s) {
      return document.querySelector(s);
    },
    selectAll = function (s) {
      return document.querySelectorAll(s);
    },
    container = select('.container'),
    circleDragger = select('#circleDragger'),
    scPlayer,
    vinylStartRotation = 31,
    vinylEndRotation = 53,
    vinylRotationScale = vinylEndRotation - vinylStartRotation,
    trackDuration;
  
    // Center the container
    TweenMax.set(container, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50
    });
    TweenMax.set('svg', {
      visibility: 'visible'
    });
  
    TweenMax.set('#armGroup', {
      svgOrigin: '396.5 188'
    });
  
    TweenMax.set([circleDragger], {
      svgOrigin: '396.5 188'
    });
  
    TweenMax.set('#vinylShineGroup', {
      transformOrigin: '50% 50%'
    });
  
    var tl = new TimelineMax();
    tl.fromTo(
      '#arm',
      1,
      {
        strokeDashoffset: '100%',
        strokeDasharray: '100%'
      },
      {
        strokeDashoffset: '0%',
        strokeDasharray: '100%',
        ease: Power1.easeOut
      }
    )
      .from('#balance', 1, {
        attr: {
          r: 0
        },
        ease: Back.easeIn // Replaced Anticipate.easeIn with Back.easeIn
      }, '-=1')
      .to(
        '#arm',
        2,
        {
          strokeDashoffset: '100%',
          strokeDasharray: '100%',
          ease: Power4.easeInOut
        },
        '-=0.5'
      )
      .from('#stylus', 1, {
        scale: 0,
        transformOrigin: '75% 15%',
        ease: Power2.easeInOut
      }, '-=0.9')
      .staggerFrom(
        '#vinylGroup circle',
        2,
        {
          attr: {
            r: 0
          },
          ease: Elastic.easeOut.config(1, 0.82)
        },
        0.46,
        '-=0.6'
      )
      .from(
        '#titleGroup',
        0.5,
        {
          scale: 0.8,
          alpha: 0,
          transformOrigin: '50% 50%'
        },
        '-=2.6'
      );
  
    tl.timeScale(1.2);
  
    var vinylShineTl = new TimelineMax({ paused: true });
    vinylShineTl.to(
      ['#vinylShine1', '#vinylShine2', '#vinylShine3'],
      1.4,
      {
        drawSVG: '65% 78%',
        ease: Linear.easeNone
      }
    ).to(
      ['#vinylShineGroup'],
      3.3,
      {
        rotation: '+=360',
        repeat: -1,
        yoyo: false,
        transformOrigin: '50% 50%',
        ease: Linear.easeNone
      },
      '-=1.4'
    );
  
    var stylusDragger = Draggable.create(circleDragger, {
      type: 'rotation',
      trigger: '#dragger',
      cursor: 'pointer',
      bounds: { min: 0, max: vinylStartRotation },
      onDrag: onDrag,
      onRelease: onDragEnd,
      onPress: onPress
    });
  
    function onDrag() {
      TweenMax.set('#armGroup', {
        rotation: circleDragger._gsTransform.rotation
      });
    }
  
    function onPress() {
      scPlayer.pause();
      setSylusHold();
    }
  
    function onDragEnd() {
      // Return stylus to off position
      if (circleDragger._gsTransform.rotation < vinylStartRotation) {
        TweenMax.to(['#armGroup'], 0.3, {
          rotation: 0,
          ease: Back.easeOut.config(0.6)
        });
        TweenMax.set(circleDragger, {
          rotation: 0
        });
        stopVinyl();
        scPlayer.pause();
        setSylusDropped();
        return;
      }
  
      if (scPlayer.currentTime() > 0) {
        var headDragPercent =
          (circleDragger._gsTransform.rotation - vinylStartRotation) /
          vinylRotationScale;
        scPlayer.play();
        scPlayer.seek(headDragPercent * trackDuration);
        playVinyl();
        setSylusDropped();
        return;
      }
  
      if (circleDragger._gsTransform.rotation >= vinylStartRotation) {
        scPlayer.play();
        TweenMax.to('#armGroup', 0.3, {
          rotation: vinylStartRotation,
          ease: Back.easeOut.config(0.6)
        });
        TweenMax.set(circleDragger, {
          rotation: vinylStartRotation
        });
        playVinyl();
        setSylusDropped();
      }
      stylusDragger[0].vars.bounds.max = vinylEndRotation;
      stylusDragger[0].applyBounds();
    }
  
    function setSylusDropped() {
      TweenMax.to('#armGroup', 0.2, {
        scaleY: 1,
        ease: Back.easeOut.config(2)
      });
    }
  
    function setSylusHold() {
      TweenMax.to('#armGroup', 0.2, {
        scaleY: 0.98,
        ease: Back.easeOut.config(0.3)
      });
    }
  
    function playVinyl() {
      if (vinylShineTl.paused()) {
        vinylShineTl.resume();
      }
    }
  
    function stopVinyl() {
      vinylShineTl.pause();
      TweenMax.to(['#vinylShine1', '#vinylShine2', '#vinylShine3'], 1, {
        drawSVG: '100% 100%',
        ease: Linear.easeNone,
        onComplete: function () {
          TweenMax.set(['#vinylShine1', '#vinylShine2', '#vinylShine3'], {
            drawSVG: '30% 30%'
          });
        }
      });
      TweenMax.to(['#vinylShineGroup'], 3.3, {
        rotation: '+=90',
        ease: Power1.easeOut
      });
    }
  
    function endTrack() {
      TweenMax.to([circleDragger, '#armGroup'], 2, {
        rotation: 0,
        ease: Back.easeOut.config(0.3)
      });
      stopVinyl();
    }
  
    function updateDragger() {
      var trackTimePercent = scPlayer.currentTime() / trackDuration;
      TweenMax.to([circleDragger, '#armGroup'], 0.1, {
        rotation: vinylStartRotation + trackTimePercent * vinylRotationScale,
        ease: Linear.easeNone
      });
    }
  
    // Rolling vinyls
    const vinyl = document.querySelector('.rolling');
    const vinylTwo = document.querySelector('.rolling-two');
    const vinylThree = document.querySelector('.rolling-three');
    const textTrail = document.querySelector('.text-trail');
    const textTrailTwo = document.querySelector('.text-trail-two');
    const textTrailThree = document.querySelector('.text-trail-three');

    // Function to check scroll position and animate the circle
    function checkScroll() {
        // Define the scroll trigger point
        const scrollPosition = window.scrollY || window.pageYOffset;

        // Calculate the rotation angle based on the scroll position
        const rotationAngle = scrollPosition * 1.0; // Adjust the multiplier for rotation speed
    
        // Calculate the position of the circle and text based on the scroll position
        const vinylPosition = (scrollPosition >= 500) ? '-130px' : '-1350px'; // Adjust the final position
        const textOpacity = (scrollPosition >= 500) ? 1 : 0; // Show the text when the circle is in position
        const textTranslateX = (scrollPosition >= 500) ? '-100%' : '-1350%'; // Move the text in when the circle is in position
        const vinylTwoPosition = (scrollPosition >= 900) ? '-130px' : '-1350px';
        const textOpacityTwo = (scrollPosition >= 900) ? 1 : 0;
        const textTranslateXTwo = (scrollPosition >= 900) ? '-100%' : '-1350%';
        const vinylThreePosition = (scrollPosition >= 1300) ? '-130px' : '-1350px';
        const textOpacityThree = (scrollPosition >= 1300) ? 1 : 0;
        const textTranslateXThree = (scrollPosition >= 1300) ? '-100%' : '-1350%';

        // Update the style properties for the circle and text
        vinyl.style.left = vinylPosition; // Adjust the final position
        vinyl.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation
        textTrail.style.opacity = textOpacity;
        textTrail.style.transform = `translateX(${textTranslateX})`;
        vinylTwo.style.left = vinylTwoPosition; // Adjust the final position
        vinylTwo.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation
        textTrailTwo.style.opacity = textOpacityTwo;
        textTrailTwo.style.transform = `translateX(${textTranslateXTwo})`;
        vinylThree.style.left = vinylThreePosition; // Adjust the final position
        vinylThree.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation
        textTrailThree.style.opacity = textOpacityThree;
        textTrailThree.style.transform = `translateX(${textTranslateXThree})`;

        // Call the animation frame for smooth transitions
        requestAnimationFrame(checkScroll);
    }

    // Listen for scroll events
    window.addEventListener('scroll', checkScroll);

    // Call the checkScroll function initially
    checkScroll();

    //Making text appear post vinyl roll
    const endText = document.querySelector('.end-roll');
    const albumText = document.querySelector('.album-text');

    function endRollText(){
        // Define the scroll trigger point
        const scrollPosition = window.scrollY || window.pageYOffset;

        const endTextOpacity = (scrollPosition >= 1600) ? 1 : 0;   
        const albumTextOpacity = (scrollPosition >= 1900) ? 1 : 0;   
        endText.style.opacity = endTextOpacity;
        albumText.style.opacity = albumTextOpacity;
        
        requestAnimationFrame(endRollText);
    }

    window.addEventListener('scroll', endRollText);
    endRollText();

    //Album Cards
    const albumOne = document.querySelector('.album-one-pic');
    const albumTwo = document.querySelector('.album-two-pic');
    const albumThree = document.querySelector('.album-three-pic');
    const albumFour = document.querySelector('.album-four-pic');
    const albumFive = document.querySelector('.album-five-pic');
    const name = document.querySelector('.text');
    const nameTwo = document.querySelector('.text-two');
    const nameThree = document.querySelector('.text-three');
    const nameFour = document.querySelector('.text-four');
    const nameFive = document.querySelector('.text-five');
    let animationStarted = false;

    function albumAppear(){
        const scrollPosition = window.scrollY || window.pageYOffset;
         
        if (scrollPosition >= 2300){
            animationStarted = true;
            albumOne.style.height = '350px';
            albumTwo.style.height = '350px';
            
            // albumOne.style.backgroundColor = '#4D4742';
        } else {
            animationStarted = false;
            albumOne.style.height = '0px';
            albumTwo.style.height = '0px';
            albumThree.style.height = '0px';
        }

        if (scrollPosition >= 2900){
            animationStarted = true;
            albumThree.style.height = '350px';
        } else {
          animationStarted = false;
          albumThree.style.height = '0px';
        }

        if (scrollPosition >= 3500){
          animationStarted = true;
          albumFour.style.height = '350px';
          albumFive.style.height = '350px';
        } else {
          animationStarted = false;
          albumFour.style.height = '0px';
          albumFive.style.height = '0px';
        }

        const albumNameOpacity = (scrollPosition >= 2300) ? 1 : 0;
        const albumNameOpacityTwo = (scrollPosition >= 3100) ? 1 : 0;
        const albumNameOpacityThree = (scrollPosition >= 3700) ? 1 : 0;
        name.style.opacity = albumNameOpacity;
        nameTwo.style.opacity = albumNameOpacity;
        nameThree.style.opacity = albumNameOpacityTwo;
        nameFour.style.opacity = albumNameOpacityThree;
        nameFive.style.opacity = albumNameOpacityThree;
    }

    window.addEventListener('scroll', albumAppear);
    albumAppear();

    //somehig
    const endAlbum = document.querySelector('.end-album');
    const personality = document.querySelector('.personality');
    const genre = document.querySelector('.genre');

    function endAlbumText(){
      // Define the scroll trigger point
      const scrollPosition = window.scrollY || window.pageYOffset;

      const endAlbumOpacity = (scrollPosition >= 3900) ? 1 : 0;   
      const personalityOpacity = (scrollPosition >= 4100) ? 1 : 0;  
      const genreOpacity = (scrollPosition >= 4300) ? 1 : 0;    
      endAlbum.style.opacity = endAlbumOpacity;
      personality.style.opacity = personalityOpacity;
      genre.style.opacity = genreOpacity;
      
      requestAnimationFrame(endAlbumText);
  }

    window.addEventListener('scroll', endAlbumText);
    endAlbumText();

    //Genres
    const genreOne = document.querySelector('.one');
    const genreTwo = document.querySelector('.two');
    const genreThree = document.querySelector('.three');
    const genreFour = document.querySelector('.four');
    const genreFive = document.querySelector('.five');
    const circleOne = document.querySelector('.genreCircle');
    const circleTwo = document.querySelector('.genreCircleTwo');
    const circleThree = document.querySelector('.genreCircleThree');
    const circleFour = document.querySelector('.genreCircleFour');
    const circleFive = document.querySelector('.genreCircleFive');

    function genreAppear(){
      // Define the scroll trigger point
      const scrollPosition = window.scrollY || window.pageYOffset;

      const genreOnePosition = (scrollPosition >= 4500) ? '390px' : '-1350px'; // Adjust the final position
      const circleOnePosition = (scrollPosition >= 4500) ? '820px' : '-1350px'; // Adjust the final position
      const genreTwoPosition = (scrollPosition >= 4600) ? '390px' : '-1350px'; // Adjust the final position
      const circleTwoPosition = (scrollPosition >= 4600) ? '800px' : '-1350px'; // Adjust the final position
      const genreThreePosition = (scrollPosition >= 4700) ? '390px' : '-1350px'; // Adjust the final position
      const circleThreePosition = (scrollPosition >= 4700) ? '590px' : '-1350px'; // Adjust the final position
      const genreFourPosition = (scrollPosition >= 4800) ? '390px' : '-1350px'; // Adjust the final position
      const circleFourPosition = (scrollPosition >= 4800) ? '1040px' : '-1350px'; // Adjust the final position
      const genreFivePosition = (scrollPosition >= 4900) ? '390px' : '-1350px'; // Adjust the final position
      const circleFivePosition = (scrollPosition >= 4900) ? '770px' : '-1350px'; // Adjust the final position

      // Update the style properties for the circle and text
      genreOne.style.left = genreOnePosition;
      genreTwo.style.left = genreTwoPosition;
      genreThree.style.left = genreThreePosition;
      genreFour.style.left = genreFourPosition;
      genreFive.style.left = genreFivePosition;
      circleOne.style.left = circleOnePosition;
      circleTwo.style.left = circleTwoPosition;
      circleThree.style.left = circleThreePosition;
      circleFour.style.left = circleFourPosition;
      circleFive.style.left = circleFivePosition;

      // Call the animation frame for smooth transitions
      requestAnimationFrame(checkScroll);
    }

    window.addEventListener('scroll', genreAppear);
    genreAppear();


  });
  