/* Still diagram (concept): inputs, a microcontroller and outputs in an intelligent system, with feedback.
   Intelligent systems › Hardware used in an intelligent system. */
HSCAnim.define('is-sense-decide-act', {
  still: true,
  title: 'Concept diagram: input, processing and output hardware',
  alt: 'Three columns. Input hardware: biometric scanners, touch and gesture devices, microphones and cameras, and sensors for temperature, motion, light and moisture. Processing: a microcontroller or small computer that runs rules or a trained model and sends data to the network. Output hardware: actuators and motors, haptic feedback, speakers, displays and VR or AR headsets. A feedback arrow returns from the outputs to the inputs, because sensors read the result of each action.',
  layouts: { wide: { size: [800, 340], minWidth: 800 }, tall: { size: [400, 860] } },
  setup(s) {
    const L = s.g(s.back), tall = s.compact;
    const cols = [
      ['Input hardware', 'Biometric scanners\nTouch and gesture\nMicrophones, cameras\nSensors: temperature,\nmotion, light, moisture', 'sky-t'],
      ['Processing', 'Microcontroller or\nsmall computer\nRuns rules or a\ntrained model\nSends data to the network', 'sage-t'],
      ['Output hardware', 'Actuators and motors\nHaptic feedback\nSpeakers and displays\nVR and AR headsets\nLights, valves, relays', 'plum-t']
    ];
    const n = cols.map(([title, body, tone], i) => {
      const x = tall ? 200 : 130 + i * 270, y = tall ? 110 + i * 250 : 150;
      const c = s.node(s.root, { x, y, w: tall ? 340 : 220, h: tall ? 190 : 190, shape: 'card', tone });
      s.text(s.root, title, { x, y: y - (tall ? 68 : 66), cls: 'pa-t pa-strong', size: 15 });
      s.text(s.root, body, { x, y: y + (tall ? 16 : 10), cls: 'pa-t', size: 13.5, lh: 1.4 });
      return c;
    });
    s.link(L, n[0], n[1], { from: tall ? 'bottom' : 'right', to: tall ? 'top' : 'left' });
    s.link(L, n[1], n[2], { from: tall ? 'bottom' : 'right', to: tall ? 'top' : 'left' });
    if (tall) {
      s.link(L, n[2], n[0], { from: 'right', to: 'right', via: [[386, 610], [386, 110]], dashed: true });
      s.text(s.root, 'Feedback: sensors read the result of the action', { x: 200, y: 836, cls: 'pa-t pa-soft', size: 13.5 });
    } else {
      s.link(L, n[2], n[0], { from: 'bottom', to: 'bottom', via: [[670, 290], [130, 290]], dashed: true });
      s.text(s.root, 'Feedback: sensors read the result of the action', { x: 400, y: 318, cls: 'pa-t pa-soft', size: 13.5 });
    }
  }
});
