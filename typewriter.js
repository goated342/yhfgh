var typeWriterElement = document.getElementById('typewriter');

// The TextArray: 
var textArray = ["It was easy to get started with AI-MAN because they had the platform and the people with the skillset to perform the annotation tasks we needed."];

// You can also do this by transfering it through a data-attribute
// var textArray = typeWriterElement.getAttribute('data-array');


// function to generate the backspace effect 
function delWriter(text, i, cb) {
	if (i >= 0 ) {
		typeWriterElement.innerHTML = text.substring(0, i--);
		// generate a random Number to emulate backspace hitting.
 		var rndBack = 10 + Math.random() * 100;
		setTimeout(function() {
			delWriter(text, i, cb);
		},rndBack); 
	} else if (typeof cb == 'function') {
		setTimeout(cb,1000);
	}
};

// function to generate the keyhitting effect
function typeWriter(text, i, cb) {
	if ( i < text.length+1 ) {
		typeWriterElement.innerHTML = text.substring(0, i++);
		// generate a random Number to emulate Typing on the Keyboard.
		var rndTyping = 250 - Math.random() * 100;
		setTimeout( function () { 
			typeWriter(text, i++, cb)
		},rndTyping);
	} else if (i === text.length+1) {
		setTimeout( function () {
			delWriter(text, i, cb)
		},1000);
	}
};

// the main writer function
function StartWriter(i) {
	if (typeof textArray[i] == "undefined") {
		setTimeout( function () {
			StartWriter(0)
		},1000);
	} else if(i < textArray[i].length+1) {
		typeWriter(textArray[i], 0, function () {
			StartWriter(i+1);
		});
	}  
};
// wait one second then start the typewriter
setTimeout( function () {
	StartWriter(100);
},1000);

const navSlide = () => {
	const burger = document.querySelector('.burger');
	const nav = document.querySelector('.main');
	const navLinks = document.querySelectorAll('.main li');
	
	//Toggle Nav
	burger.addEventListener('click', ()=>{
	  nav.classList.toggle('nav-active');
	  
	  //Animate Links
	  navLinks.forEach((link, index)=>{
		if(link.style.animation){
		  link.style.animation = ''
		}else{
			  link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`;
  
		}
	  });
	  
	  //burger animation
	  burger.classList.toggle('toggle');
	  
	  
	});
	
	
  }
  
  navSlide();

