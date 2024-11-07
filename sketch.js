// AU2140209 || NEVIL JOBANPUTRA
// DGT201 || Creative Coding

let editor;
let compilationStages = [];
let currentStage = -1;
let errorMsg = '';
let startCompilation = false;
let compilationComplete = false;
let selectedStage = null;
let analyses = {
  lexical: null,
  syntax: null,
  semantic: null,
  ir: null,
  optimized: null,
  target: null
};
let video;
let videoURL = 'https://media.istockphoto.com/id/883941260/video/binary-computer-code-animation-ones-and-zeros-flashing-on-screen.mp4?s=mp4-640x640-is&k=20&c=I7N13H2jPXPBz9HQSVwXJGcc3V2zvm1hDom7ZgLvS1Q='; 

// Animation properties
let animationInProgress = false;
let animationProgress = 0;
let currentAnimatingStage = -1;
let stageAnimationDuration = 2000;
let lastAnimationTime = 0;

let particles = [];

let stageDescriptions = {
  0: 'Lexical Analysis: Tokenizes the code into smaller parts.',
  1: 'Syntax Analysis: Builds a syntax tree from tokens.',
  2: 'Semantic Analysis: Checks for valid declarations and types.',
  3: 'IR Generation: Creates an intermediate code representation.',
  4: 'Code Optimization: Improves the code’s efficiency.',
  5: 'Code Generation: Produces the final machine code.'
};
let tooltipText = null;
let tooltipX = 0;
let tooltipY = 0;

function setup() {
  createCanvas(1600, 830);
  setupVideo();
  createModal();
  editor = createElement('textarea');
  editor.position(90, 180);
  editor.size(450, 250);
  editor.style('font-family', 'monospace');
  editor.style('padding', '10px');
  editor.style('border', '2px solid #333');
  editor.style('border-radius', '8px');
  editor.style('background-color', '#1e1e1e'); 
  editor.style('color', '#ffffff');           
  editor.value('function example() {\n  let x = 10;\n  let y = 20;\n  return x * y;\n}');
  
  createButtons();
  initializeCompilationStages();
}

function setupVideo() {
  video = createVideo(videoURL);
  video.size(1600, 830); 
  video.hide();              
  video.volume(0);           
}


class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(14, 20);
    this.char = random(['0', '1']); 
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
    this.opacity = 255;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 4;  
  }

  draw() {
    fill(255, this.opacity);
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.char, this.x, this.y);
  }

  isFaded() {
    return this.opacity <= 0;
  }
}


function createParticles(x, y) {
  for (let i = 0; i < 1; i++) { 
    particles.push(new Particle(x, y));
  }
}

function drawProgressBar() {
  let progressBarWidth = width - 180;
  let progressX = 90;
  let progressY = height -45;
  

  fill(100);
  rect(progressX, progressY, progressBarWidth, 5);

  fill('#4CAF50');
  let filledWidth = progressBarWidth * ((currentAnimatingStage + 1) / compilationStages.length);
  rect(progressX, progressY, filledWidth, 10);


  let progressPercentage = (currentAnimatingStage + animationProgress) / compilationStages.length;
  let numParticlesToEmit = 20; 

  for (let i = particles.length; i < numParticlesToEmit; i++) {
    let xPosition = progressX + random(filledWidth - 10, filledWidth); 
    let yPosition = progressY + random(-10, 10);  
    particles.push(new Particle(xPosition, yPosition)); 
  }
}



function createModal() {
  let modalDiv = createDiv();
  modalDiv.id('modal');
  modalDiv.style('position', 'fixed');
  modalDiv.style('top', '0');
  modalDiv.style('left', '0');
  modalDiv.style('width', '100%');
  modalDiv.style('height', '100%');
  modalDiv.style('background', 'rgba(0, 0, 0, 0.8)');
  modalDiv.style('display', 'flex');
  modalDiv.style('align-items', 'center');
  modalDiv.style('justify-content', 'center');
  modalDiv.style('color', '#ffffff');
  modalDiv.style('z-index', '1000');

  // Content inside the modal
  let contentDiv = createDiv(`
    <h2 style="margin: 0;">Project Title: Compiler Visualization</h2>
    <p>Name: Nevil Jobanputra
    <p>Enrollment Number: AU2140209
    <p>Course: DGT201 | Interactive Media and Visualisation
    <br>
    <button id="proceedBtn" style="margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Click to Proceed</button>
  `);
  contentDiv.style('text-align', 'center');
  modalDiv.child(contentDiv);

  // Add event listener for the button to start the video and close the modal
  select('#proceedBtn').mousePressed(() => {
    modalDiv.hide();      // Hide the modal
    video.loop();          // Start the video loop
  });
}

function drawTooltip(tooltipText, x, y) {
  textSize(14);
  fill(50, 50, 50, 200);
  let tooltipWidth = textWidth(tooltipText) + 20;
  let tooltipHeight = 30;
  rect(x, y - tooltipHeight - 10, tooltipWidth, tooltipHeight, 5);

  fill(255);
  textAlign(CENTER, CENTER);
  text(tooltipText, x + tooltipWidth / 2, y - tooltipHeight / 2 - 10);
}



function createButtons() {
  let compileBtn = createButton('Run');
  compileBtn.position(90, 460);
  compileBtn.size(100, 35);
  compileBtn.style('background-color', '#4CAF50');
  compileBtn.style('color', 'white');
  compileBtn.style('border', 'none');
  compileBtn.style('border-radius', '5px');
  compileBtn.style('cursor', 'pointer');
  compileBtn.mousePressed(startCompilationProcess);
  
  let resetBtn = createButton('Reset');
  resetBtn.position(210, 460);
  resetBtn.size(100, 35);
  resetBtn.style('background-color', '#f44336');
  resetBtn.style('color', 'white');
  resetBtn.style('border', 'none');
  resetBtn.style('border-radius', '5px');
  resetBtn.style('cursor', 'pointer');
  resetBtn.mousePressed(resetCompilation);
}



function draw() {
  image(video, 0, 0, width, height); 
  drawMonitor();
  
  if (animationInProgress) {
    updateAnimation();
  }
  
  drawCompilationProcess();
   drawProgressBar();


  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.update();
    particle.draw();

    if (particle.isFaded()) {
      particles.splice(i, 1);
    }
    // Draw tooltip last to keep it on top
  if (tooltipText) {
    drawTooltip(tooltipText, tooltipX, tooltipY);
  }
  tooltipText = null; 
  }
}


function mouseMoved() {
  createParticles(mouseX, mouseY);
}

function updateAnimation() {
  let currentTime = millis();
  let deltaTime = currentTime - lastAnimationTime;
  
  if (currentAnimatingStage < compilationStages.length) {
    animationProgress += deltaTime / stageAnimationDuration;
    
    if (animationProgress >= 1) {
      compilationStages[currentAnimatingStage].complete = true;
      selectedStage = currentAnimatingStage;
      processNextStage();
      currentAnimatingStage++;
      animationProgress = 0;
      
      if (currentAnimatingStage >= compilationStages.length) {
        animationInProgress = false;
        compilationComplete = true;
        selectedStage = compilationStages.length - 1;
      }
    }
  }
  
  lastAnimationTime = currentTime;
}

function drawCompilationProcess() {
  drawFlowchart();
  if (animationInProgress && currentAnimatingStage !== -1) {
    selectedStage = currentAnimatingStage; 
  }
  if (selectedStage !== null) {
    drawAnalysisPanel();
  }
}
function drawMonitor() {
  fill('#333333');
  rect(50, 50, 1500, 700, 15); 
  fill('#1a1a1a');
  rect(70, 70, 1460, 650, 10);

  fill('#333333');
  rect(750, 790, 200, 20);
  rect(800, 760, 100, 40);

  fill('#BBBBBB');
  textAlign(CENTER);
  textSize(28);
  text('Compiler Visualization', width / 2, 100);

  textSize(16);
  if (!compilationComplete) {
    text('Click Run to start compilation', width / 2, 130);
  } else {
    text('Click on any stage in the flowchart to view its analysis', width / 2, 130);
  }
}

function drawAnalysisPanel() {
  let panelX = 950;
  let panelY = 180;
  let panelWidth = 550;
  let panelHeight = 500;

  fill('#222222');
  rect(panelX, panelY, panelWidth, panelHeight, 8);

  textAlign(LEFT, TOP);
  textSize(18);
  fill('#BBBBBB');

  let stage = compilationStages[selectedStage];
  let analysis = analyses[getAnalysisKey(selectedStage)];

  fill('#BBBBBB');
  textStyle(BOLD);
  text(stage.name + ' Results:', panelX + 20, panelY + 20);
  textStyle(NORMAL);

  textSize(14);
  let contentY = panelY + 60;
  
  if (analysis) {
    let lines = analysis.split('\n');
    lines.forEach((line, i) => {
      text(line, panelX + 20, contentY + i * 20);
    });
  } else {
    text("Analysis not available yet.", panelX + 20, contentY);
  }
}

function drawFlowchart() {
  let startX = 660;
  let startY = 180;
  let boxWidth = 250;
  let boxHeight = 45;
  let spacing = 50;
  
  for (let i = 0; i < compilationStages.length; i++) {
    let stage = compilationStages[i];
    let x = startX;
    let y = startY + i * (boxHeight + spacing);

    let isHovered = isMouseOverBox(x, y, boxWidth, boxHeight);
    let isSelected = selectedStage === i;

    let glowEffect = 255;
    if (i === currentAnimatingStage && animationInProgress) {
      glowEffect = 200 + (sin(millis() * 0.005) * 55);  
    }

    let stageColor = color(stage.color);
    if (isSelected) {
      fill(stage.color);
    } else if (isHovered && stage.complete) {
      fill(lerpColor(stageColor, color(glowEffect), 0.3));
    } else {
      stageColor.setAlpha(glowEffect);
      fill(stageColor);
    }

    if (i > 0) {
      stroke('#888888');
      if (i === currentAnimatingStage && animationInProgress) {
        let lineProgress = min(1, animationProgress * 2);
        let lineEndY = y - spacing / 2 + (spacing / 2 * lineProgress);
        line(x + boxWidth / 2, y - spacing / 2, x + boxWidth / 2, lineEndY);
      } else if (stage.complete || i < currentAnimatingStage) {
        line(x + boxWidth / 2, y - spacing / 2, x + boxWidth / 2, y);
      }
    }


    let boxAlpha = 255;
    if (i === currentAnimatingStage && animationInProgress) {
      let boxProgress = max(0, (animationProgress - 0.5) * 2);
      boxAlpha = boxProgress * 255;
    }

    if (isHovered && stage.complete) {
      tooltipText = stageDescriptions[i];
      tooltipX = mouseX;
      tooltipY = mouseY;
    }

    if (i <= currentAnimatingStage || stage.complete) {
      stageColor.setAlpha(boxAlpha);
      fill(isSelected ? stage.color : (isHovered && stage.complete ? lerpColor(stageColor, color(255), 0.3) : stageColor));
    } else {
      fill(60);
    }
    

    stroke(200);
    rect(x, y, boxWidth, boxHeight, 8);


    fill(255, boxAlpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(stage.name, x + boxWidth / 2, y + boxHeight / 2);

    if (stage.complete && isHovered) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }

    stage.bounds = { x, y, width: boxWidth, height: boxHeight };
  }
}


function isMouseOverBox(x, y, width, height) {
  return mouseX > x && mouseX < x + width && 
         mouseY > y && mouseY < y + height;
}

function mouseClicked() {
  if (compilationComplete) {
    compilationStages.forEach((stage, index) => {
      if (stage.complete && 
          mouseX > stage.bounds.x && 
          mouseX < stage.bounds.x + stage.bounds.width &&
          mouseY > stage.bounds.y && 
          mouseY < stage.bounds.y + stage.bounds.height) {
        selectedStage = index;
      }
    });
  }
}


function getAnalysisKey(stageIndex) {
  const keys = ['lexical', 'syntax', 'semantic', 'ir', 'optimized', 'target'];
  return keys[stageIndex];
}

function processNextStage() {
  currentStage++;
  compilationStages[currentStage].complete = true;

  switch(currentStage) {
    case 0:
      performLexicalAnalysis();
      break;
    case 1:
      performSyntaxAnalysis();
      break;
    case 2:
      performSemanticAnalysis();
      break;
    case 3:
      generateIR();
      break;
    case 4:
      performOptimization();
      break;
    case 5:
      generateTargetCode();
      compilationComplete = true;
      selectedStage = 5;
      break;
  }

  selectedStage = currentStage;
}



function performLexicalAnalysis() {
  let code = editor.value();
  let tokens = code.match(/(\w+|[{}()=;*+\-/><!])/g).map(token => ({
    type: /^\d+$/.test(token) ? 'NUMBER' :
          /^[a-zA-Z_]\w*$/.test(token) ? 'IDENTIFIER' :
          'SYMBOL',
    value: token
  }));
  analyses.lexical = formatTokens(tokens);
}

function formatTokens(tokens) {
  return tokens.map(token => 
    `Token: ${token.value.padEnd(10)} | Type: ${token.type}`
  ).join('\n');
}

function performSyntaxAnalysis() {
  let ast = {
    type: 'Program',
    body: [{
      type: 'FunctionDeclaration',
      id: { type: 'Identifier', name: 'example' },
      params: [],
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [
              { type: 'Identifier', name: 'x', value: 10 }
            ]
          }
        ]
      }
    }]
  };
  analyses.syntax = formatAST(ast);
}

function formatAST(node, depth = 0) {
  const indent = '  '.repeat(depth);
  let result = `${indent}${node.type}\n`;
  
  for (let key in node) {
    if (key !== 'type' && typeof node[key] === 'object') {
      if (node[key] !== null) {
        result += `${indent}${key}: \n${formatAST(node[key], depth + 1)}`;
      }
    } else if (key !== 'type') {
      result += `${indent}${key}: ${node[key]}\n`;
    }
  }
  return result;
}

function performSemanticAnalysis() {
  let symbolTable = {
    variables: {
      x: { type: 'number', scope: 'local', initialized: true },
      y: { type: 'number', scope: 'local', initialized: true }
    },
    functions: {
      example: { returnType: 'number', parameters: [] }
    }
  };
  analyses.semantic = formatSymbolTable(symbolTable);
}

function formatSymbolTable(table) {
  let result = 'Symbol Table:\n\nVariables:\n';
  for (let varName in table.variables) {
    const v = table.variables[varName];
    result += `${varName}:\n  Type: ${v.type}\n  Scope: ${v.scope}\n  Initialized: ${v.initialized}\n\n`;
  }
  result += 'Functions:\n';
  for (let funcName in table.functions) {
    const f = table.functions[funcName];
    result += `${funcName}:\n  Return Type: ${f.returnType}\n  Parameters: ${f.parameters.length ? f.parameters.join(', ') : 'none'}\n`;
  }
  return result;
}

function generateIR() {
  let ir = [
    'FUNCTION example',
    'DECLARE x',
    'DECLARE y',
    'ASSIGN x, 10',
    'ASSIGN y, 20',
    'MULTIPLY temp1, x, y',
    'RETURN temp1',
    'END FUNCTION'
  ];
  analyses.ir = ir.join('\n');
}

function performOptimization() {
  let optimized = [
    'FUNCTION example',
    '# Constant folding applied',
    'ASSIGN temp1, 200  # Optimized: 10 * 20',
    'RETURN temp1',
    'END FUNCTION'
  ];
  analyses.optimized = optimized.join('\n');
}

function generateTargetCode() {
  let assembly = [
    'section .text',
    'global _start',
    '_example:',
    '    push ebp',
    '    mov ebp, esp',
    '    mov eax, 200    ; Optimized result',
    '    pop ebp',
    '    ret',
    '_start:',
    '    call _example',
    '    mov ebx, 0',
    '    mov eax, 1',
    '    int 0x80'
  ];
  analyses.target = assembly.join('\n');
}

function startCompilationProcess() {
  let code = editor.value().trim();
  if (code.length === 0) {
    errorMsg = 'Please enter some code';
    return;
  }
  
  resetCompilation();
  startCompilation = true;

  performLexicalAnalysis();
  performSyntaxAnalysis();
  performSemanticAnalysis();
  generateIR();
  performOptimization();
  generateTargetCode();

  // Initialize animation
  animationInProgress = true;
  currentAnimatingStage = 0;
  animationProgress = 0;
  lastAnimationTime = millis();
}



function processAllStages() {
  while (currentStage < compilationStages.length - 1) {
    processNextStage();
  }
}
function resetCompilation() {
  errorMsg = '';
  currentStage = -1;
  startCompilation = false;
  compilationComplete = false;
  selectedStage = null;
  animationInProgress = false;
  currentAnimatingStage = -1;
  animationProgress = 0;
  analyses = {
    lexical: null,
    syntax: null,
    semantic: null,
    ir: null,
    optimized: null,
    target: null
  };
  compilationStages.forEach(stage => stage.complete = false);
}


function initializeCompilationStages() {
  compilationStages = [
    { name: 'Lexical Analysis', color: '#B8860B', complete: false }, // Darker Gold
    { name: 'Syntax Analysis', color: '#006400', complete: false }, // Darker Green
    { name: 'Semantic Analysis', color: '#4682B4', complete: false }, // Steel Blue
    { name: 'IR Generation', color: '#8B008B', complete: false }, // Dark Magenta
    { name: 'Code Optimization', color: '#CD5C5C', complete: false }, // Indian Red
    { name: 'Code Generation', color: '#008B8B', complete: false }  // Dark Cyan
  ];
}
