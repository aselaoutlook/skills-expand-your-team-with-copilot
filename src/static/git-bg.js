/**
 * Animated Git-style branch lines for the page background.
 * Draws slowly-scrolling commit graphs with branches and merges.
 */
(function () {
  const canvas = document.getElementById("git-bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── Colour palette (lime-green school theme) ──────────────────────────
  const LANE_COLORS = [
    "#5c8a00", // lime green (primary)
    "#8abd2e", // light lime
    "#3a5900", // dark lime
    "#76b900", // bright lime
    "#a4d65e", // pale lime
  ];

  const COMMIT_RADIUS = 5;
  const LANE_SPACING = 60; // horizontal gap between lanes
  const COMMIT_SPACING = 80; // vertical gap between commits on same lane
  const SCROLL_SPEED = 0.4; // pixels per frame (slow drift upward)

  let offset = 0; // vertical scroll offset
  let lanes = [];

  // ── Build a static commit graph layout ───────────────────────────────
  function buildLanes(canvasWidth) {
    const numLanes = Math.max(3, Math.floor(canvasWidth / LANE_SPACING) - 1);
    lanes = [];

    for (let l = 0; l < numLanes; l++) {
      const x = LANE_SPACING + l * LANE_SPACING;
      const color = LANE_COLORS[l % LANE_COLORS.length];
      const commits = [];

      // Stagger commit positions per lane
      const startY = -COMMIT_SPACING * 2 + l * 20;
      const total = 30; // commits to pre-generate (enough to fill screen + buffer)

      for (let i = 0; i < total; i++) {
        commits.push(startY + i * COMMIT_SPACING);
      }

      lanes.push({ x, color, commits });
    }
  }

  // Branch connection data: [ fromLane, fromCommitIndex, toLane, toCommitIndex ]
  // We generate these once based on lane count.
  let branches = [];

  function buildBranches() {
    branches = [];
    const numLanes = lanes.length;
    if (numLanes < 2) return;

    // Create some branch-off and merge-in connections
    const patterns = [
      [0, 3, 1, 5],
      [1, 7, 2, 9],
      [0, 10, 2, 13],
      [2, 4, 3, 6],
      [3, 8, 4, 11],
      [1, 14, 3, 17],
      [0, 18, 1, 20],
      [2, 16, 4, 19],
      [4, 2, 3, 4],
    ];

    for (const [fl, fi, tl, ti] of patterns) {
      if (fl < numLanes && tl < numLanes) {
        branches.push({ fromLane: fl, fromIdx: fi, toLane: tl, toIdx: ti });
      }
    }
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildLanes(canvas.width);
    buildBranches();
  }

  // ── Drawing ───────────────────────────────────────────────────────────
  function drawLane(lane) {
    const x = lane.x;
    ctx.strokeStyle = lane.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Draw vertical line spanning the entire canvas height
    ctx.moveTo(x, -20);
    ctx.lineTo(x, canvas.height + 20);
    ctx.stroke();

    // Draw commits (circles)
    for (const baseY of lane.commits) {
      const y = ((baseY + offset) % (canvas.height + COMMIT_SPACING * 5)) -
        COMMIT_SPACING * 2;
      // Only draw if on screen (with buffer)
      if (y < -COMMIT_RADIUS * 2 || y > canvas.height + COMMIT_RADIUS * 2) continue;

      ctx.beginPath();
      ctx.arc(x, y, COMMIT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = lane.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function getCommitY(laneIndex, commitIndex) {
    const lane = lanes[laneIndex];
    if (!lane) return 0;
    const baseY = lane.commits[commitIndex] || 0;
    const total = canvas.height + COMMIT_SPACING * 5;
    return ((baseY + offset) % total) - COMMIT_SPACING * 2;
  }

  function drawBranches() {
    for (const b of branches) {
      const fromLane = lanes[b.fromLane];
      const toLane = lanes[b.toLane];
      if (!fromLane || !toLane) continue;

      const x1 = fromLane.x;
      const y1 = getCommitY(b.fromLane, b.fromIdx);
      const x2 = toLane.x;
      const y2 = getCommitY(b.toLane, b.toIdx);

      // Skip if both endpoints are off screen
      if (
        (y1 < -50 && y2 < -50) ||
        (y1 > canvas.height + 50 && y2 > canvas.height + 50)
      )
        continue;

      ctx.strokeStyle = fromLane.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      // Bezier curve for a smooth branch-line
      ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
      ctx.stroke();
    }
  }

  // ── Animation loop ────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const lane of lanes) {
      drawLane(lane);
    }
    drawBranches();

    offset = (offset + SCROLL_SPEED) % (COMMIT_SPACING * 5 + canvas.height);
    requestAnimationFrame(draw);
  }

  // ── Init ──────────────────────────────────────────────────────────────
  window.addEventListener("resize", resize);
  resize();
  draw();
})();
