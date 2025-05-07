// Draw the text expansion transition
function drawTransition() {
  // Draw cosmic background first
  drawInsideStarBackground();
  
  // Draw the clicked star to emphasize it as the source
  if (currentStar) {
    // Draw the star
    fill(currentStar.hue, currentStar.saturation, currentStar.brightness);
    noStroke();
    ellipse(currentStar.x, currentStar.y, currentStar.radius * 2);
    
    // Draw glow
    for (let i = currentStar.radius * 3; i >= currentStar.radius; i -= 2) {
      let alpha = map(i, currentStar.radius * 3, currentStar.radius, 0, 150);
      alpha = alpha * (1 - transitionProgress); // Fade out as transition progresses
      fill(currentStar.hue, currentStar.saturation, currentStar.brightness, alpha);
      ellipse(currentStar.x, currentStar.y, i * 2);
    }
  }
  
  // Draw expanding text particles
  for (let i = 0; i < transitionTexts.length; i++) {
    let t = transitionTexts[i];
    
    // Calculate current position based on progress
    let currentX = lerp(t.startX, t.endX, transitionProgress);
    let currentY = lerp(t.startY, t.endY, transitionProgress);
    
    // Calculate opacity (fade in)
    let opacity = map(transitionProgress, 0, 0.5, 0, 255);
    
    // Calculate size (grow from small)
    let currentSize = map(transitionProgress, 0, 0.7, 5, t.size);
    
    // Draw the character
    fill(t.hue, 70, 100, opacity);
    textSize(currentSize);
    text(t.char, currentX, currentY);
    
    // Draw optional trail effect
    if (transitionProgress < 0.8) {
      for (let j = 1; j <= 3; j++) {
        let trailProgress = max(0, transitionProgress - j * 0.05);
        let trailX = lerp(t.startX, t.endX, trailProgress);
        let trailY = lerp(t.startY, t.endY, trailProgress);
        let trailOpacity = opacity * (1 - j * 0.3);
        let trailSize = currentSize * (1 - j * 0.2);
        
        fill(t.hue, 70, 100, trailOpacity);
        textSize(trailSize);
        text(t.char, trailX, trailY);
      }
    }
  }
  
  // Draw exit button with fade in
  if (transitionProgress > 0.7) {
    let buttonOpacity = map(transitionProgress, 0.7, 1, 0, 255);
    fill(0, 0, 80, buttonOpacity);
    noStroke();
    rect(width - 100, 20, 80, 40, 20);
    
    fill(0, 0, 100, buttonOpacity);
    textSize(16);
    text("返回 / Back", width - 60, 40);
  }
}// Start text expansion transition
function startTextExpansionTransition(star) {
  // Prepare transition
  transitionActive = true;
  transitionProgress = 0;
  transitionCounter = 0;
  transitionTexts = [];
  
  // Set up floating texts (but don't switch to inside star view yet)
  // Create placeholder texts at star position for transition
  let memoryTexts = prepareMemoryTexts(star);
  
  // Store current star position for transition
  let starX = star.x;
  let starY = star.y;
  
  // Create transition texts (all starting at the star's position)
  for (let i = 0; i < memoryTexts.length; i++) {
    let memory = memoryTexts[i];
    
    for (let j = 0; j < memory.text.length; j++) {
      let char = memory.text.charAt(j);
      
      // All characters start at star position
      let startX = starX;
      let startY = starY;
      
      // Final random position
      let endX = random(width * 0.1, width * 0.9);
      let endY = random(height * 0.1, height * 0.9);
      
      // Final organized position (for later use)
      let organizedX = memory.startX + j * (memory.isChinese ? 40 : 18);
      let organizedY = memory.yPosition;
      
      // Font size
      let size = memory.isChinese ? random(24, 40) : random(18, 32);
      
      // Create transition text object
      transitionTexts.push({
        char: char,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        organizedX: organizedX,
        organizedY: organizedY,
        size: size,
        opacity: 0, // Start transparent
        hue: random(180, 360)
      });
    }
  }
}

// Create structured memory texts for transition
function prepareMemoryTexts(star) {
  let result = [];
  
  // Organize memories by type
  let chineseMemories = [];
  let englishMemories = [];
  
  for (let i = 0; i < star.memories.length; i++) {
    let memory = star.memories[i];
    
    if (/[\u4e00-\u9fa5]/.test(memory.charAt(0))) {
      chineseMemories.push(memory);
    } else {
      englishMemories.push(memory);
    }
  }
  
  // Add Chinese memories with positions
  for (let i = 0; i < chineseMemories.length; i++) {
    result.push({
      text: chineseMemories[i],
      startX: width * 0.25,
      yPosition: height * 0.3 + i * 50,
      isChinese: true
    });
  }
  
  // Add English memories with positions
  for (let i = 0; i < englishMemories.length; i++) {
    result.push({
      text: englishMemories[i],
      startX: width * 0.25,
      yPosition: height * 0.6 + i * 40,
      isChinese: false
    });
  }
  
  return result;
}// Variables for text expansion transition
let transitionActive = false;
let transitionProgress = 0;
let transitionDuration = 120; // Number of frames for transition
let transitionCounter = 0;
let transitionTexts = [];// FloatingText class for characters inside stars
class FloatingText {
  constructor(character, x, y, size, organizedX, organizedY) {
    this.character = character;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.organizedX = organizedX || width/2;
    this.organizedY = organizedY || height/2;
    this.size = size;
    
    // Movement properties
    this.xSpeed = random(-0.5, 0.5);
    this.ySpeed = random(-0.5, 0.5);
    
    // Appearance properties
    this.opacity = random(150, 255);
    this.hue = random(180, 360);
    
    // Animation properties
    this.movementSpeed = random(0.03, 0.06);
  }
  
  update(organized = false) {
    if (organized && !blowingActive) {
      // Move toward organized position
      this.targetX = this.organizedX;
      this.targetY = this.organizedY;
    } else {
      // Continue random movement or respond to blowing
      this.xSpeed += random(-0.1, 0.1);
      this.ySpeed += random(-0.1, 0.1);
      
      // Cap speeds
      this.xSpeed = constrain(this.xSpeed, -1, 1);
      this.ySpeed = constrain(this.ySpeed, -1, 1);
      
      // Update target position based on random movement
      this.targetX += this.xSpeed;
      this.targetY += this.ySpeed;
      
      // Bounce off edges
      if (this.targetX < width * 0.1 || this.targetX > width * 0.9) {
        this.xSpeed *= -1;
        this.targetX += this.xSpeed * 2;
      }
      if (this.targetY < height * 0.1 || this.targetY > height * 0.9) {
        this.ySpeed *= -1;
        this.targetY += this.ySpeed * 2;
      }
    }
    
    // Smoothly move toward target
    this.x = lerp(this.x, this.targetX, this.movementSpeed);
    this.y = lerp(this.y, this.targetY, this.movementSpeed);
  }
  
  display() {
    // Adapt opacity based on how close to target position
    let distance = dist(this.x, this.y, this.targetX, this.targetY);
    let dynamicOpacity = map(distance, 0, 50, this.opacity, this.opacity * 0.7);
    
    fill(this.hue, 70, 100, dynamicOpacity);
    textSize(this.size);
    text(this.character, this.x, this.y);
  }
}// Memory Nebula - Interactive Art Project
// A thousand-year portal to share memories with the future

let stars = [];       // Collection of stars in the nebula
let floatingTexts = [];  // Collection of text elements inside a star
let currentStar = null;  // Currently opened star
let insideStar = false;  // Flag to indicate if we're inside a star
let mic;              // Microphone input
let osc;              // Oscillator for sound effects
let micLevel = 0;     // Current microphone input level
let micInitialized = false; // Flag to track if mic has been initialized
let micRecording = false;   // Flag to track if mic is actively recording
let textOrganized = false;  // Flag to track if text is organized or scattered
let speechRec;        // Speech recognition object
let recordedText = ""; // Text recorded from speech recognition
let isRecognizing = false; // Flag to track if speech recognition is active
let blowingActive = false;  // Flag to track if blowing effect is active
let blowingMicLevel = 0;    // Blowing microphone level
let lastBlowingTime = 0;    // Last time a blow was detected
let memories = [         // Initial memories
  "我还记得童年时的那个夏天，蝉鸣声中的冰棍是最甜的",
  "The popsicle in the cicada sound of that summer in my childhood was the sweetest",
  "记忆像海浪一样涌来，又像潮水一样退去",
  "Memories come like waves and recede like tides",
  "1000年后的人们，你们还会仰望同样的星空吗",
  "People 1000 years later, will you still look up at the same starry sky",
  "时间的长河中，我们只是短暂的存在，但我们的记忆将永存",
  "In the river of time, we are but brief existences, yet our memories will live on",
  "科技日新月异，但人类的情感亘古不变",
  "Technology evolves rapidly, but human emotions remain unchanged throughout ages"
];

// Set up microphone and oscillator
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container");
  
  // Initialize oscillator
  osc = new p5.Oscillator();
  osc.setType('sine');
  osc.amp(0);
  osc.start();
  
  // Create initial stars
  for (let i = 0; i < 10; i++) {
    createNewStar();
  }
  
  // Text settings
  textAlign(CENTER, CENTER);
  colorMode(HSB, 360, 100, 100, 255);
  
  // Initialize speech recognition if available
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRec = new SpeechRecognition();
    speechRec.continuous = true;
    speechRec.interimResults = true;
    
    // Handle results
    speechRec.onresult = function(event) {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript !== '') {
        recordedText = finalTranscript;
        console.log("Recognized text:", recordedText);
        
        // Create a new star with this recognized text
        if (recordedText.trim() !== '') {
          createStarFromVoice(recordedText);
          recordedText = ''; // Reset for next recording
        }
      }
    };
    
    // Handle errors
    speechRec.onerror = function(event) {
      console.error("Speech recognition error", event.error);
      stopSpeechRecognition();
    };
    
    // Handle end of recognition
    speechRec.onend = function() {
      isRecognizing = false;
      console.log("Speech recognition ended");
    };
  } else {
    console.log("Speech Recognition API not supported in this browser");
  }
}

function draw() {
  // Clear the background
  background(240, 30, 15); // Dark blue background in HSB
  
  // Handle transition if active
  if (transitionActive) {
    drawTransition();
    transitionCounter++;
    
    // Update transition progress
    transitionProgress = min(1, transitionCounter / transitionDuration);
    
    // Check if transition is complete
    if (transitionProgress >= 1) {
      // Finish transition and set up the actual star view
      transitionActive = false;
      setupFloatingTextForStar(currentStar);
    }
    
    return; // Skip the rest of draw during transition
  }
  
  if (!insideStar) {
    // In nebula view
    
    // Get microphone level if initialized
    if (micInitialized) {
      micLevel = mic.getLevel();
      
      // Also update blowing level if active
      if (blowingActive) {
        blowingMicLevel = micLevel;
        
        // Apply blowing effect if sufficient level
        if (blowingMicLevel > 0.1) {
          applyBlowingToStars(mouseX, mouseY, blowingMicLevel);
        }
      }
    } else {
      micLevel = 0;
    }
    
    // Draw background stars
    drawBackgroundStars();
    
    // Update and display all stars
    for (let i = 0; i < stars.length; i++) {
      // Pass mic level to stars
      stars[i].update(micLevel);
      
      // Draw connections between stars
      for (let j = 0; j < stars.length; j++) {
        if (i !== j) {
          stars[i].connect(stars[j]);
        }
      }
      
      // Display the star
      stars[i].display();
    }
    
    // Display instructions
    fill(0, 0, 100, 200);
    textSize(16);
    text("点击星星查看记忆 / Click stars to view memories", width / 2, height - 30);
    text("按空格键添加你的记忆 / Press SPACE to add your memory", width / 2, height - 50);
    
    // Show mic buttons
    drawVoiceButton();
    drawBlowButton();
    
    // Show speech recognition status if active
    if (isRecognizing) {
      fill(120, 80, 100, 200);
      textSize(16);
      text("正在录音...说出你的记忆 / Recording...speak your memory", width / 2, 30);
      text("已识别: " + (recordedText ? recordedText : "..."), width / 2, 60);
    }
    
    // Show mic level if active
    if (micInitialized && (micRecording || blowingActive)) {
      let levelHeight = map(micLevel, 0, 0.5, 0, 50);
      fill(100, 80, 100, 200);
      rect(20, height - 20 - levelHeight, 10, levelHeight);
    }
    
  } else {
    // Inside a star view
    
    // Handle blowing effect in star view
    if (micInitialized && blowingActive) {
      blowingMicLevel = mic.getLevel();
      
      // Apply blowing to text if sufficient level
      if (blowingMicLevel > 0.1) {
        applyBlowingToText(mouseX, mouseY, blowingMicLevel);
      }
    }
    
    // Draw cosmic background
    drawInsideStarBackground();
    
    // Update and display all floating texts
    for (let i = 0; i < floatingTexts.length; i++) {
      // Update with organized/scattered state
      floatingTexts[i].update(textOrganized);
      floatingTexts[i].display();
    }
    
    // Display exit button
    drawExitButton();
    
    // Display blow button in star view
    drawBlowButton();
    
    // Display instruction for text organization
    fill(0, 0, 100, 200);
    textSize(16);
    if (textOrganized) {
      text("点击屏幕随机排列文字 / Click to scatter text", width / 2, height - 30);
    } else {
      text("点击屏幕组合文字还原记忆 / Click to organize text", width / 2, height - 30);
    }
  }
}

// Draw small stars in the background
function drawBackgroundStars() {
  // Add some small background stars
  let numStars = 100;
  if (micLevel > 0) {
    numStars = map(micLevel, 0, 0.5, 100, 150);
  }
  
  for (let i = 0; i < numStars; i++) {
    let size = random(0.5, 2);
    let alpha = random(100, 255);
    fill(0, 0, 100, alpha);
    noStroke();
    ellipse(random(width), random(height), size, size);
  }
}

// Draw the cosmic background inside a star
function drawInsideStarBackground() {
  // Draw nebula-like background
  for (let i = 0; i < 200; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(0.5, 3);
    let h = random(180, 260);
    let s = random(70, 100);
    let b = random(80, 100);
    let alpha = random(50, 150);
    
    fill(h, s, b, alpha);
    noStroke();
    ellipse(x, y, size, size);
  }
  
  // Draw some cosmic dust
  for (let i = 0; i < 10; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = x1 + random(-100, 100);
    let y2 = y1 + random(-100, 100);
    let h = random(180, 260);
    let s = random(70, 100);
    let b = random(80, 100);
    let alpha = random(20, 50);
    
    stroke(h, s, b, alpha);
    strokeWeight(random(1, 3));
    line(x1, y1, x2, y2);
  }
}

// Draw blowing mic button
function drawBlowButton() {
  // Button background
  fill(blowingActive ? 0 : 100, 80, 90, 200);
  noStroke();
  rect(20, height - 70, 160, 40, 20);
  
  // Button text
  fill(0, 0, 100);
  textSize(16);
  if (blowingActive) {
    text("停止吹气 / Stop Blowing", 100, height - 50);
  } else {
    text("开始吹气 / Start Blowing", 100, height - 50);
  }
}

// Draw voice recognition button
function drawVoiceButton() {
  // Button background
  fill(isRecognizing ? 0 : 100, 80, 90, 200);
  noStroke();
  rect(width - 180, height - 70, 160, 40, 20);
  
  // Button text
  fill(0, 0, 100);
  textSize(16);
  if (isRecognizing) {
    text("停止语音输入 / Stop Voice", width - 100, height - 50);
  } else {
    text("开始语音输入 / Start Voice", width - 100, height - 50);
  }
}

// Draw exit button
function drawExitButton() {
  fill(0, 0, 80, 100);
  noStroke();
  rect(width - 100, 20, 80, 40, 20);
  
  fill(0, 0, 100);
  textSize(16);
  text("返回 / Back", width - 60, 40);
}

// Create a new star with random properties
function createNewStar() {
  // Select random memories for this star
  let starMemories = [];
  let numMemories = floor(random(1, 3)); // 1-2 memories per star
  
  for (let i = 0; i < numMemories; i++) {
    let index = floor(random(memories.length));
    starMemories.push(memories[index]);
  }
  
  // Create the star
  let x = random(width * 0.1, width * 0.9);
  let y = random(height * 0.1, height * 0.9);
  let size = random(5, 15);
  
  stars.push(new Star(x, y, size, starMemories));
}

// Play a tone using the oscillator
function playTone(freq, dur) {
  osc.freq(freq);
  osc.amp(0.2, 0.05);
  
  // Schedule the fade out
  setTimeout(function() {
    osc.amp(0, 0.1);
  }, dur);
}

// Toggle blowing effect
function toggleBlowing() {
  if (!micInitialized) {
    // Initialize microphone
    userStartAudio().then(() => {
      console.log("Audio initialized for blowing");
      mic = new p5.AudioIn();
      mic.start();
      micInitialized = true;
      blowingActive = true;
    }).catch(err => {
      console.error("Audio initialization failed:", err);
      alert("无法启动麦克风！请检查浏览器权限。\nMicrophone initialization failed!");
    });
  } else {
    // Toggle blowing state
    blowingActive = !blowingActive;
    
    // Play sound to indicate state change
    if (blowingActive) {
      playTone(587.33, 100); // D5
    } else {
      playTone(523.25, 100); // C5
    }
  }
}

// Apply blowing effect to stars
function applyBlowingToStars(centerX, centerY, strength) {
  // Blowing influence radius
  let blowRadius = map(strength, 0.1, 1, 100, 400);
  
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    
    // Calculate distance
    let d = dist(centerX, centerY, star.x, star.y);
    
    // If within influence range
    if (d < blowRadius) {
      // Calculate blowing force (stronger when closer)
      let force = map(d, 0, blowRadius, strength * 30, 0);
      
      // Calculate direction
      let angle = atan2(star.y - centerY, star.x - centerX);
      
      // Apply force
      star.applyForce(force * cos(angle), force * sin(angle));
      
      // Change star size
      star.radius = constrain(star.radius + random(-1, 3) * strength, 2, 20);
    }
  }
}

// Apply blowing effect to text
function applyBlowingToText(centerX, centerY, strength) {
  // Blowing influence radius
  let blowRadius = map(strength, 0.1, 1, 150, 500);
  
  for (let i = 0; i < floatingTexts.length; i++) {
    let text = floatingTexts[i];
    
    // Calculate distance
    let d = dist(centerX, centerY, text.x, text.y);
    
    // If within influence range
    if (d < blowRadius) {
      // Calculate blowing force (stronger when closer)
      let force = map(d, 0, blowRadius, strength * 50, 0);
      
      // Calculate direction
      let angle = atan2(text.y - centerY, text.x - centerX);
      
      // Apply force (directly change speed)
      text.xSpeed += force * cos(angle) * 0.5;
      text.ySpeed += force * sin(angle) * 0.5;
      
      // Change font size
      text.size = constrain(text.size + random(-2, 5) * strength, 10, 60);
    }
  }
}

// Handle mouse clicks
function mousePressed() {
  // Check if blowing button was clicked
  if (mouseX > 20 && mouseX < 180 && mouseY > height - 70 && mouseY < height - 30) {
    toggleBlowing();
    return;
  }
  
  // Check if voice button was clicked in nebula view
  if (!insideStar && mouseX > width - 180 && mouseX < width - 20 && 
      mouseY > height - 70 && mouseY < height - 30) {
    toggleMicrophone();
    return;
  }
  
  if (!insideStar) {
    // Check if a star was clicked
    for (let i = 0; i < stars.length; i++) {
      if (stars[i].contains(mouseX, mouseY)) {
        // Enter this star with text expansion transition
        currentStar = stars[i];
        startTextExpansionTransition(currentStar);
        
        // Play a sound based on star size
        let noteFreq = map(stars[i].radius, 3, 15, 523.25, 783.99); // C5 to G5
        playTone(noteFreq, 300);
        
        return; // Exit function after handling star click
      }
    }
  } else {
    // Check if exit button was clicked
    if (mouseX > width - 100 && mouseX < width - 20 && mouseY > 20 && mouseY < 60) {
      exitStar();
      // Play a different tone when exiting
      playTone(392.00, 200); // G4
      return; // Exit function after handling button click
    }
    
    // Toggle between organized and scattered text
    textOrganized = !textOrganized;
    
    // Play a tone based on organization state
    if (textOrganized) {
      // Play ascending scale for organization
      playTone(261.63, 100); // C4
      setTimeout(() => playTone(293.66, 100), 100); // D4
      setTimeout(() => playTone(329.63, 100), 200); // E4
    } else {
      // Play descending scale for scattering
      playTone(329.63, 100); // E4
      setTimeout(() => playTone(293.66, 100), 100); // D4
      setTimeout(() => playTone(261.63, 100), 200); // C4
    }
  }
}

// Toggle microphone recording
function toggleMicrophone() {
  if (!micInitialized) {
    // Initialize microphone for level detection
    userStartAudio().then(() => {
      console.log("Audio initialized");
      mic = new p5.AudioIn();
      mic.start();
      micInitialized = true;
      micRecording = true;
      
      // Start speech recognition
      startSpeechRecognition();
    }).catch(err => {
      console.error("Audio initialization failed:", err);
      alert("无法启动麦克风！请检查浏览器权限。\nMicrophone initialization failed! Please check browser permissions.");
    });
  } else {
    // Toggle recording state
    micRecording = !micRecording;
    
    // Toggle speech recognition
    if (micRecording) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    
    // Play sound to indicate state change
    if (micRecording) {
      playTone(440, 100); // A4
    } else {
      playTone(349.23, 100); // F4
    }
  }
}

// Start speech recognition
function startSpeechRecognition() {
  if (speechRec && !isRecognizing) {
    try {
      speechRec.start();
      isRecognizing = true;
      console.log("Speech recognition started");
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      alert("无法启动语音识别！\nCould not start speech recognition!");
    }
  }
}

// Stop speech recognition
function stopSpeechRecognition() {
  if (speechRec && isRecognizing) {
    try {
      speechRec.stop();
      isRecognizing = false;
      console.log("Speech recognition stopped");
    } catch (err) {
      console.error("Could not stop speech recognition:", err);
    }
  }
}

// Create a star from recognized voice
function createStarFromVoice(text) {
  if (text && text.trim() !== "") {
    // Add to memories list
    memories.push(text);
    
    // Create a new star with this memory
    let x = random(width * 0.1, width * 0.9);
    let y = random(height * 0.1, height * 0.9);
    let size = random(5, 15);
    
    let star = new Star(x, y, size, [text]);
    star.highlight = true;
    stars.push(star);
    
    // Play ascending note sequence for new memory
    let baseNote = 261.63; // C4
    playTone(baseNote, 150);
    setTimeout(() => playTone(baseNote * 5/4, 150), 150); // E4
    setTimeout(() => playTone(baseNote * 3/2, 150), 300); // G4
    
    console.log("Created star from voice input:", text);
  }
}

// Setup floating text for a star (called before transition) 
function setupFloatingTextForStar(star) {
  insideStar = true;
  floatingTexts = [];
  textOrganized = false; // Start with scattered text
  
  // Organize the memories by type (Chinese vs English)
  let chineseMemories = [];
  let englishMemories = [];
  
  for (let i = 0; i < star.memories.length; i++) {
    let memory = star.memories[i];
    
    // Check if the memory is primarily Chinese or English
    if (/[\u4e00-\u9fa5]/.test(memory.charAt(0))) {
      chineseMemories.push(memory);
    } else {
      englishMemories.push(memory);
    }
  }
  
  // Store original sequences for later organization
  let chineseSequence = [];
  let englishSequence = [];
  
  // Create individual character objects for Chinese memories
  for (let i = 0; i < chineseMemories.length; i++) {
    let memory = chineseMemories[i];
    let startX = width * 0.25;
    let yPosition = height * 0.3 + i * 50;
    
    for (let j = 0; j < memory.length; j++) {
      let char = memory.charAt(j);
      let x = random(width * 0.1, width * 0.9); // Random start position
      let y = random(height * 0.1, height * 0.9);
      let size = random(24, 40);
      
      // Save the organized position
      let organizedX = startX + j * 40;
      let organizedY = yPosition;
      
      let ft = new FloatingText(char, x, y, size, organizedX, organizedY);
      floatingTexts.push(ft);
      chineseSequence.push(ft);
    }
  }
  
  // Create individual character objects for English memories
  for (let i = 0; i < englishMemories.length; i++) {
    let memory = englishMemories[i];
    let startX = width * 0.25;
    let yPosition = height * 0.6 + i * 40;
    
    for (let j = 0; j < memory.length; j++) {
      let char = memory.charAt(j);
      let x = random(width * 0.1, width * 0.9); // Random start position
      let y = random(height * 0.1, height * 0.9);
      let size = random(18, 32);
      
      // Save the organized position
      let organizedX = startX + j * 18;
      let organizedY = yPosition;
      
      let ft = new FloatingText(char, x, y, size, organizedX, organizedY);
      floatingTexts.push(ft);
      englishSequence.push(ft);
    }
  }
}

// Exit the current star
function exitStar() {
  insideStar = false;
  currentStar = null;
  floatingTexts = [];
}

// Handle key presses
function keyPressed() {
  if (key === ' ' && !insideStar) {
    // Ask user for a new memory
    let newMemory = prompt("请输入你想分享的记忆 / Please enter a memory you want to share:");
    
    if (newMemory && newMemory.trim() !== "") {
      // Add to memories list
      memories.push(newMemory);
      
      // Create a new star with this memory
      let x = random(width * 0.1, width * 0.9);
      let y = random(height * 0.1, height * 0.9);
      let size = random(5, 15);
      
      stars.push(new Star(x, y, size, [newMemory]));
      
      // Play ascending note sequence for new memory
      let baseNote = 261.63; // C4
      playTone(baseNote, 150);
      setTimeout(() => playTone(baseNote * 5/4, 150), 150); // E4
      setTimeout(() => playTone(baseNote * 3/2, 150), 300); // G4
    }
  }
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Star class
class Star {
  constructor(x, y, radius, memories) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.radius = radius;
    this.memories = memories;
    this.brightnessPulse = random(0, TWO_PI);
    this.hue = random(180, 260); // Blue to purple hues
    this.saturation = random(70, 100);
    this.brightness = random(80, 100);
    this.highlight = false; // For visual feedback when created by mic
    this.highlightTime = 0;
    
    // Movement properties
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.moveSpeed = random(0.0005, 0.002);
    
    // Glow effect
    this.glowSize = this.radius * 2;
    this.maxGlowSize = this.radius * 3;
  }
  
  applyForce(fx, fy) {
    // Offset original position
    this.originalX += fx * 0.1;
    this.originalY += fy * 0.1;
    
    // Apply immediate force
    this.x += fx * 0.9;
    this.y += fy * 0.9;
    
    // Increase glow effect
    this.maxGlowSize = this.radius * (3 + random(1, 3));
    this.highlight = true;
    this.highlightTime = 0;
  }
  
  update(micLevel = 0) {
    // Update position using Perlin noise for organic movement
    this.noiseOffsetX += this.moveSpeed;
    this.noiseOffsetY += this.moveSpeed;
    
    let noiseX = noise(this.noiseOffsetX);
    let noiseY = noise(this.noiseOffsetY);
    
    // Base movement
    let moveAmount = map(this.radius, 3, 15, 60, 30); // Smaller stars move more
    this.x = this.originalX + map(noiseX, 0, 1, -moveAmount, moveAmount);
    this.y = this.originalY + map(noiseY, 0, 1, -moveAmount, moveAmount);
    
    // Add microphone influence
    if (micLevel > 0.01) {
      let micInfluence = map(micLevel, 0.01, 0.5, 1, 15);
      this.x += random(-micInfluence, micInfluence);
      this.y += random(-micInfluence, micInfluence);
      
      // Increase glow effect with mic level
      this.maxGlowSize = this.radius * (3 + micLevel * 5);
    }
    
    // Update brightness pulse
    this.brightnessPulse += 0.02;
    if (this.brightnessPulse > TWO_PI) {
      this.brightnessPulse -= TWO_PI;
    }
    
    // Handle highlight effect
    if (this.highlight) {
      this.highlightTime += 1;
      if (this.highlightTime > 60) {
        this.highlight = false;
        this.highlightTime = 0;
      }
    }
  }
  
  display() {
    // Calculate pulsing brightness
    let brightnessMod = map(sin(this.brightnessPulse), -1, 1, -20, 20);
    let currentBrightness = this.brightness + brightnessMod;
    
    // Adjust color for highlight (newly created from sound)
    let displayHue = this.hue;
    if (this.highlight) {
      displayHue = (frameCount * 5) % 360; // Rainbow effect
      currentBrightness = 100; // Full brightness
    }
    
    // Draw glow effect
    for (let i = this.maxGlowSize; i >= this.radius; i -= 2) {
      let alpha = map(i, this.maxGlowSize, this.radius, 0, 150);
      if (this.highlight) alpha = map(i, this.maxGlowSize, this.radius, 0, 255);
      
      fill(displayHue, this.saturation, currentBrightness, alpha);
      noStroke();
      ellipse(this.x, this.y, i * 2);
    }
    
    // Draw the star
    fill(displayHue, this.saturation, currentBrightness);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2);
  }
  
  connect(other) {
    // Draw connection line to nearby stars
    let d = dist(this.x, this.y, other.x, other.y);
    let maxDist = 150;
    
    if (d < maxDist) {
      // Calculate transparency based on distance
      let alpha = map(d, 0, maxDist, 150, 0);
      
      // Calculate color based on both stars
      let h = (this.hue + other.hue) / 2;
      
      // Highlight connection if either star is highlighted
      if (this.highlight || other.highlight) {
        h = (frameCount * 5) % 360; // Rainbow effect
        alpha = alpha * 2;
      }
      
      stroke(h, 80, 90, alpha);
      strokeWeight(1);
      line(this.x, this.y, other.x, other.y);
    }
  }
  
  contains(px, py) {
    // Check if point is inside star's clickable area
    let d = dist(px, py, this.x, this.y);
    return d < this.radius * 1.5; // Make hitbox a bit larger for easier clicking
  }
}
