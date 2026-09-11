/* ============================================================================
 * content.js — everything the site knows about Jashan.
 * Each console mode is a different renderer over this one object, so content
 * only ever gets written once.
 * ========================================================================== */

window.SITE = {
  name: "Jashan Multani",
  first: "JASHAN",
  last: "MULTANI",
  role: "Computer Engineering @ Waterloo",
  blurb: "Firmware, embedded systems, and the point where software stops being abstract and starts moving something physical.",

  thesis: "I've wanted to build a smart house since I was a kid. Not buy one — build one. I want to yell for a Coke Zero and have it come down a chute in the ceiling. I'll probably need to build something to protect my head next.",
  thesis2: "It doesn't count as laziness if every light, lock, and sensor is running on code I wrote myself. That's still the plan, and it's more or less why I ended up here.",
  fleet: "So far the fleet includes a bin that opens when you walk at it, an arm made of popsicle sticks, and a robot that follows a line until something rude gets in the way. The chute is still pending.",

  status: [
    ["Location", "Waterloo, Ontario"],
    ["Program",  "BASc Computer Engineering (Co-op)"],
    ["Focus",    "Firmware & embedded systems"],
    ["Seeking",  "Summer 2027 co-op"]
  ],

  experience: [
    {
      org: "Ascendance Foundry",
      role: "Forward Deployed Engineer Intern",
      when: "Jun – Aug 2026",
      where: "Toronto · Hybrid",
      bullets: [
        "Built **CoachBot**, an internal Claude Code plugin that installs a team's engineering standards, tooling and institutional knowledge with a single command — rolling out to **20+ fellows** in future cohorts.",
        "Architected it as a **five-agent pipeline**: planning, execution, test design, test runs and documentation each handled by a separate agent that checks the others' work.",
        "Implemented GitHub-backed auto-updates and per-user personalization that survives version bumps, so nobody redistributes anything by hand.",
        "Automated contract generation from a sales spreadsheet, cutting drafting **from an hour to under two minutes**."
      ]
    },
    {
      org: "Twin Brothers Wholesale",
      role: "Data Analyst",
      when: "Dec 2025 – Jan 2026",
      where: "Lansing, MI",
      bullets: [
        "Analyzed consumer purchasing patterns in Python and Pandas to support inventory optimization.",
        "Delivered demand-forecasting recommendations for operations processing **$30K per day**."
      ]
    },
    {
      org: "Century 21",
      role: "Real Estate Marketing Intern",
      when: "Jul – Aug 2025",
      where: "Brampton, ON",
      bullets: [
        "Analyzed sales and listing data in Excel to identify buyer segments; ran **50+ cold calls daily**.",
        "Recommended prioritizing listings near schools after identifying a family-oriented buyer segment."
      ]
    }
  ],

  projects: [
    {
      id: "line",
      name: "Line-Following Robot",
      full: "Line-Following & Obstacle-Avoidance Robot",
      year: "2026",
      status: "In progress",
      hook: "Some robots follow instructions. Others follow a line and figure things out when something gets in the way.",
      body: "Two IR sensors underneath track a black line and continuously correct the robot's heading. An ultrasonic sensor up front adds a second layer: when something appears within range, the robot abandons the line, backs up, steers around the obstacle, then hunts for the line again before carrying on.",
      lesson: "Driving around a box is easy. Ending up back on the line afterwards is not — that's the whole project.",
      parts: ["Arduino Uno", "IR sensors", "Ultrasonic", "Motor control", "Circuits"],
      img: "assets/img/Line_Following.jpg",
      video: "assets/video/line-following.mp4",
      repo: "https://github.com/Jashan-Mshadow/line-following-robot"
    },
    {
      id: "skills",
      name: "OntarioSkills Robot",
      full: "OntarioSkills Competition Robot",
      year: "2024–26",
      status: "5th in Ontario",
      hook: "Think of a warehouse worker, but made of metal, wires, and code.",
      body: "A motorized claw that lifts, carries and drops boxes while navigating a set course. Sensors and control logic working together so it aligns with targets and moves loads without tipping.",
      lesson: "The claw was basically a butterfingers at first. Fixing it needed grip strength AND timing — code alone won't save you if the build can't handle it.",
      parts: ["C++", "Motor control", "Sensors", "Mechanical design"],
      img: "assets/img/OntarioSkills.jpg",
      video: "assets/video/ontarioskills-robot.mp4",
      repo: "https://github.com/Jashan-Mshadow/ontarioskills-robot"
    },
    {
      id: "arm",
      name: "Popsicle Robot Arm",
      full: "Popsicle-Stick Robot Arm",
      year: "2024",
      status: "Complete",
      hook: "Three servo motors, three potentiometers, and a bunch of popsicle sticks walk into a workshop… and leave as a robotic arm.",
      body: "Each potentiometer drives one degree of freedom — up/down, left/right, wrist rotation. The servos are positioned to balance range against stability, so it lifts small objects without straining the motors.",
      lesson: "The up-and-down servo kept stabbing the floor like it was mad at it, so I clamped its range from 0–180° to 90–180°. Software guard, mechanical problem.",
      parts: ["Arduino Uno", "Servos", "Potentiometers", "Circuits"],
      img: "assets/img/RobotArmImage1.jpg",
      video: "assets/video/robot-arm.mp4",
      repo: "https://github.com/Jashan-Mshadow/popsicle-robot-arm"
    },
    {
      id: "bin",
      name: "Smart Trash Can",
      full: "Smart Trash Can",
      year: "2025",
      status: "Complete",
      hook: "A hands-free bin that opens when you walk up to it.",
      body: "An ultrasonic sensor watches for distance and a servo lifts the lid through a reinforced popsicle-stick arm. The goal was to make throwing something out more hygienic and slightly cooler than a normal trash can.",
      lesson: "Too short a trigger range and you wave your hand like crazy; too far and it opens when you walk past. Small adjustments, huge difference to whether it's actually usable.",
      parts: ["Arduino Uno", "Ultrasonic", "Servo", "Mechanical design"],
      img: "assets/img/SmartTrashBin.jpg",
      video: "assets/video/smart-trash-can.mp4",
      repo: "https://github.com/Jashan-Mshadow/smart-trash-can"
    },
    {
      id: "night",
      name: "Night Light",
      full: "Photoresistor Night Light",
      year: "2025",
      status: "Complete",
      hook: "A nightlight that switches itself on when the room gets dark. No microcontroller — just a photoresistor and good soldering.",
      body: "A photoresistor senses the light level and the LED kicks in below threshold. Everything laid out flush on perfboard and soldered down.",
      lesson: "Too much heat can make your LED's life flash before your eyes. Tin the pad, touch, leave.",
      parts: ["Soldering", "Perfboard", "Photoresistor"],
      img: "assets/img/Nightlight.jpg",
      repo: "https://github.com/Jashan-Mshadow/workshop"
    },
    {
      id: "tag",
      name: "Asteroid Metal Tag",
      full: "Asteroid Impact Metal Tag",
      year: "2025",
      status: "Complete",
      hook: "My first real dive into CNC, as both designer and manufacturer.",
      body: "A 3″×2″ block of aluminium became an asteroid impact scene, because I love space. Mapped in V-Carve with toolpaths across three different bits for layered depth, then cut, filed and milled.",
      lesson: "I'm more of a software person, so the CNC mill felt like learning to drive a spaceship.",
      parts: ["CNC milling", "V-Carve", "Cutoff saw", "Filing"],
      img: "assets/img/Asteroid.jpg",
      repo: "https://github.com/Jashan-Mshadow/workshop"
    },
    {
      id: "pen",
      name: "Machined Pen",
      full: "Machined Aluminium Pen",
      year: "2025",
      status: "Complete",
      hook: "This isn't just a pen — it's my pen.",
      body: "Sketches, then an orthographic drawing at 1:2 scale. Turned the tip from a cylindrical blank on the metal lathe, drilled a centred bore, cut grooves and knurling, matched the body, then threaded both halves so they screw together.",
      lesson: "Every stage depended on the accuracy of the last. Threading punishes a 0.2 mm error from three steps earlier.",
      parts: ["Metal lathe", "Knurling", "Threading", "Orthographic drawing"],
      img: "assets/img/Pen1.jpg",
      repo: "https://github.com/Jashan-Mshadow/workshop"
    },
    {
      id: "plane",
      name: "Chocolate Mould",
      full: "Airplane Chocolate Mould",
      year: "2025",
      status: "Complete",
      hook: "A 2×2″ aluminium mould carrying a 3D airplane at two elevations.",
      body: "Cut, milled and CNC-machined for depth, then used to form a plastic mould for chocolate. The exercise was balancing an intricate design against what the machine could actually cut.",
      lesson: "I over-milled the aluminium and had to restart. That's the CNC version of deleting your work with no undo.",
      parts: ["V-Carve", "CNC milling", "Cutoff saw"],
      img: "assets/img/Airplane1.jpg",
      repo: "https://github.com/Jashan-Mshadow/workshop"
    },
    {
      id: "trophy",
      name: "Pokémon Trophy",
      full: "Pokémon Trophy",
      year: "2025",
      status: "Complete",
      hook: "A custom trophy designed from scratch, blending CAD with 3D printing.",
      body: "Base modelled in Tinkercad, refined in SolidWorks, prepared in V-Carve. The topper printed for both detail and durability, cleaned up and mounted.",
      lesson: "Detail and strength pull in opposite directions. Infill, layer height and orientation decide which one you get.",
      parts: ["SolidWorks", "Tinkercad", "3D printing", "V-Carve"],
      img: "assets/img/PokemonTrophy1.jpg",
      repo: "https://github.com/Jashan-Mshadow/workshop"
    }
  ],

  skills: [
    ["Languages",   ["C++", "Python", "TypeScript / JavaScript", "Google Apps Script"]],
    ["Embedded",    ["Arduino", "Sensor integration", "Motor control", "Circuits & soldering"]],
    ["Software",    ["React", "Pandas / NumPy", "Git & GitHub", "Multi-agent systems"]],
    ["Fabrication", ["SolidWorks", "CNC milling & V-Carve", "Metal lathe", "3D printing"]]
  ],

  interests: [
    ["Space", "I follow space and astronomy far more closely than is useful. The asteroid tag was not a coincidence."],
    ["Swimming", "In the pool most weeks. The one hobby with no screen involved, which is exactly the point."],
    ["Marvel & Pokémon", "I'll talk your ear off about either, given the smallest opening. There's a trophy in the projects as evidence."],
    ["DECA", "Two years, finishing as chapter president of a 200+ member chapter and an Ontario provincial champion in Financial Trading & Decision Making."]
  ],

  contact: {
    email: "jashandeepm2008@gmail.com",
    linkedin: "https://linkedin.com/in/jashanmultani",
    github: "https://github.com/Jashan-Mshadow",
    line: "Looking for a Summer 2027 co-op in software or firmware. Always up for talking about embedded systems, or the Coke Zero chute."
  },

  /* UNIT-01's canned answers. Not an LLM, and it says so. */
  qa: [
    ["Why should I hire him?", "Three internships before university, a tool now onboarding 20+ people, and a contract process he cut from an hour to two minutes. Also he actually finishes things. I've watched."],
    ["What's the smart house thing?", "His long-running plan to automate an entire house himself. Current blocker: a Coke Zero chute in the ceiling, and no ceiling access."],
    ["Is he actually good at C++?", "Good enough to place 5th in Ontario with a robot running it. Not good enough to claim he's finished learning. He'd tell you the same."],
    ["What's he doing right now?", "First-year Computer Engineering at Waterloo, hunting a Summer 2027 co-op, building embedded things in his spare time."],
    ["Tell me something weird.", "His longest debug was an IR sensor reading a shadow as a black line. The robot kept turning into a wall. He blamed the code for two days."],
    ["Are you a real AI?", "No. I'm a list of sentences he wrote and a bit of JavaScript. Cheaper than an API key, and I never hallucinate his GPA."]
  ]
};
