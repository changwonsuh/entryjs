var Entry = {block:{}, TEXT_ALIGN_CENTER:0, TEXT_ALIGN_LEFT:1, TEXT_ALIGN_RIGHT:2, TEXT_ALIGNS:["center", "left", "right"], clipboard:null, loadProject:function(b) {
  b || (b = Entry.getStartProject(Entry.mediaFilePath));
  "workspace" == this.type && Entry.stateManager.startIgnore();
  Entry.projectId = b._id;
  Entry.variableContainer.setVariables(b.variables);
  Entry.variableContainer.setMessages(b.messages);
  Entry.scene.addScenes(b.scenes);
  Entry.stage.initObjectContainers();
  Entry.variableContainer.setFunctions(b.functions);
  Entry.container.setObjects(b.objects);
  Entry.FPS = b.speed ? b.speed : 60;
  createjs.Ticker.setFPS(Entry.FPS);
  "workspace" == this.type && Entry.stateManager.endIgnore();
  Entry.engine.projectTimer || Entry.variableContainer.generateTimer();
  0 === Object.keys(Entry.container.inputValue).length && Entry.variableContainer.generateAnswer();
  Entry.start();
  return b;
}, exportProject:function(b) {
  b || (b = {});
  Entry.engine.isState("stop") || Entry.engine.toggleStop();
  Entry.Func && Entry.Func.workspace && Entry.Func.workspace.visible && Entry.Func.cancelEdit();
  b.objects = Entry.container.toJSON();
  b.scenes = Entry.scene.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.functions = Entry.variableContainer.getFunctionJSON();
  b.scenes = Entry.scene.toJSON();
  b.speed = Entry.FPS;
  return b;
}, setBlockByText:function(b, a) {
  for (var d = [], c = jQuery.parseXML(a).getElementsByTagName("category"), e = 0;e < c.length;e++) {
    for (var f = c[e], g = {category:f.getAttribute("id"), blocks:[]}, f = f.childNodes, h = 0;h < f.length;h++) {
      var k = f[h];
      !k.tagName || "BLOCK" != k.tagName.toUpperCase() && "BTN" != k.tagName.toUpperCase() || g.blocks.push(k.getAttribute("type"));
    }
    d.push(g);
  }
  Entry.playground.setBlockMenu(d);
}, setBlock:function(b, a) {
  Entry.playground.setMenuBlock(b, a);
}, enableArduino:function() {
}, initSound:function(b) {
  b.path = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/" + b.filename + b.ext;
  Entry.soundQueue.loadFile({id:b.id, src:b.path, type:createjs.LoadQueue.SOUND});
}, beforeUnload:function(b) {
  Entry.hw.closeConnection();
  Entry.variableContainer.updateCloudVariables();
  if ("workspace" == Entry.type && (localStorage && Entry.interfaceState && localStorage.setItem("workspace-interface", JSON.stringify(Entry.interfaceState)), !Entry.stateManager.isSaved())) {
    return Lang.Workspace.project_changed;
  }
}, loadInterfaceState:function() {
  if ("workspace" == Entry.type) {
    if (localStorage && localStorage.getItem("workspace-interface")) {
      var b = localStorage.getItem("workspace-interface");
      this.resizeElement(JSON.parse(b));
    } else {
      this.resizeElement({menuWidth:280, canvasWidth:480});
    }
  }
}, resizeElement:function(b) {
  if ("workspace" == Entry.type) {
    var a = this.interfaceState;
    !b.canvasWidth && a.canvasWidth && (b.canvasWidth = a.canvasWidth);
    !b.menuWidth && this.interfaceState.menuWidth && (b.menuWidth = a.menuWidth);
    Entry.engine.speedPanelOn && Entry.engine.toggleSpeedPanel();
    (a = b.canvasWidth) ? 325 > a ? a = 325 : 720 < a && (a = 720) : a = 400;
    b.canvasWidth = a;
    var d = 9 * a / 16;
    Entry.engine.view_.style.width = a + "px";
    Entry.engine.view_.style.height = d + "px";
    Entry.engine.view_.style.top = "40px";
    Entry.stage.canvas.canvas.style.height = d + "px";
    Entry.stage.canvas.canvas.style.width = a + "px";
    400 <= a ? Entry.engine.view_.removeClass("collapsed") : Entry.engine.view_.addClass("collapsed");
    Entry.playground.view_.style.left = a + .5 + "px";
    Entry.propertyPanel.resize(a);
    var c = Entry.engine.view_.getElementsByClassName("entryAddButtonWorkspace_w")[0];
    c && (Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.width = .7 * a + "px") : c.style.display = "none");
    if (c = Entry.engine.view_.getElementsByClassName("entryRunButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * a + "px", c.style.width = .3 * a + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = a - 4 + "px");
    }
    if (c = Entry.engine.view_.getElementsByClassName("entryStopButtonWorkspace_w")[0]) {
      Entry.objectAddable ? (c.style.top = d + 24 + "px", c.style.left = .7 * a + "px", c.style.width = .3 * a + "px") : (c.style.left = "2px", c.style.top = d + 24 + "px", c.style.width = a + "px");
    }
    (a = b.menuWidth) ? 244 > a ? a = 244 : 400 < a && (a = 400) : a = 264;
    b.menuWidth = a;
    $(".blockMenuContainer").css({width:a - 64 + "px"});
    $(".blockMenuContainer>svg").css({width:a - 64 + "px"});
    Entry.playground.mainWorkspace.blockMenu.setWidth();
    $(".entryWorkspaceBoard").css({left:a + "px"});
    Entry.playground.resizeHandle_.style.left = a + "px";
    Entry.playground.variableViewWrapper_.style.width = a + "px";
    this.interfaceState = b;
  }
  Entry.windowResized.notify();
}, getUpTime:function() {
  return (new Date).getTime() - this.startTime;
}, addActivity:function(b) {
  Entry.stateManager && Entry.stateManager.addActivity(b);
}, startActivityLogging:function() {
  Entry.reporter && Entry.reporter.start(Entry.projectId, window.user ? window.user._id : null, Entry.startTime);
}, getActivityLog:function() {
  var b = {};
  Entry.stateManager && (b.activityLog = Entry.stateManager.activityLog_);
  return b;
}, DRAG_MODE_NONE:0, DRAG_MODE_MOUSEDOWN:1, DRAG_MODE_DRAG:2, cancelObjectEdit:function(b) {
  var a = Entry.playground.object;
  if (a) {
    var d = b.target;
    b = 0 !== $(a.view_).find(d).length;
    d = d.tagName.toUpperCase();
    !a.isEditing || "INPUT" === d && b || a.editObjectValues(!1);
  }
}};
window.Entry = Entry;
Entry.Albert = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, leftEye:0, rightEye:0, note:0, bodyLed:0, frontLed:0, padWidth:0, padHeight:0}, setZero:function() {
  var b = Entry.Albert.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Albert;
  b.tempo = 60;
  b.removeAllTimeouts();
}, monitorTemplate:{imgPath:"hw/albert.png", width:387, height:503, listPorts:{oid:{name:"OID", type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, note:{name:Lang.Hw.note, type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.ALBERT_sensor_leftProximity, type:"input", pos:{x:178, y:401}}, rightProximity:{name:Lang.Blocks.ALBERT_sensor_rightProximity, type:"input", pos:{x:66, y:359}}, battery:{name:Lang.Blocks.ALBERT_sensor_battery, type:"input", 
pos:{x:88, y:368}}, light:{name:Lang.Blocks.ALBERT_sensor_light, type:"input", pos:{x:127, y:391}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:299, y:406}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:22, y:325}}, leftEye:{name:Lang.Hw.leftEye, type:"output", pos:{x:260, y:26}}, rightEye:{name:Lang.Hw.rightEye, type:"output", pos:{x:164, y:13}}, bodyLed:{name:Lang.Hw.body + " " + Lang.Hw.led, type:"output", pos:{x:367, y:308}}, frontLed:{name:Lang.Hw.front + " " + Lang.Hw.led, 
pos:{x:117, y:410}}}, mode:"both"}, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"albert"};
Blockly.Blocks.albert_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.albert_hand_found = function(b, a) {
  var d = Entry.hw.portData;
  return 40 < d.leftProximity || 40 < d.rightProximity;
};
Blockly.Blocks.albert_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.ALBERT_sensor_leftProximity, "leftProximity"], [Lang.Blocks.ALBERT_sensor_rightProximity, "rightProximity"], [Lang.Blocks.ALBERT_sensor_light, "light"], [Lang.Blocks.ALBERT_sensor_battery, "battery"], [Lang.Blocks.ALBERT_sensor_signalStrength, "signalStrength"], [Lang.Blocks.ALBERT_sensor_frontOid, "frontOid"], [Lang.Blocks.ALBERT_sensor_backOid, "backOid"], [Lang.Blocks.ALBERT_sensor_positionX, "positionX"], 
  [Lang.Blocks.ALBERT_sensor_positionY, "positionY"], [Lang.Blocks.ALBERT_sensor_orientation, "orientation"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.albert_value = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.albert_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = 30;
  d.rightWheel = 30;
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = -30;
  d.rightWheel = -30;
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (d.leftWheel = -30, d.rightWheel = 30) : (d.leftWheel = 30, d.rightWheel = -30);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, d);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_both_wheels_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + c : c;
  d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e;
  return a.callReturn();
};
Blockly.Blocks.albert_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_both_wheels_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = a.getNumberValue("LEFT");
  d.rightWheel = a.getNumberValue("RIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheel_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e : ("RIGHT" != c && (d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e), d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheel_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = e : ("RIGHT" != c && (d.leftWheel = e), d.rightWheel = e);
  return a.callReturn();
};
Blockly.Blocks.albert_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_stop = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = 0;
  d.rightWheel = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_pad_size_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_1);
  this.appendValueInput("WIDTH").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_2);
  this.appendValueInput("HEIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_pad_size_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_pad_size_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.padWidth = a.getNumberValue("WIDTH");
  d.padHeight = a.getNumberValue("HEIGHT");
  return a.callReturn();
};
Blockly.Blocks.albert_set_eye_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_eye_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_eye_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.ALBERT_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.ALBERT_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.ALBERT_set_eye_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_eye_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == c ? d.leftEye = e : ("RIGHT" != c && (d.leftEye = e), d.rightEye = e);
  return a.callReturn();
};
Blockly.Blocks.albert_clear_eye = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_eye_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_eye_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_eye = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a);
  "LEFT" == c ? d.leftEye = 0 : ("RIGHT" != c && (d.leftEye = 0), d.rightEye = 0);
  return a.callReturn();
};
Blockly.Blocks.albert_body_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_body_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_body_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_body_led = function(b, a) {
  var d = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? d.bodyLed = 1 : d.bodyLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_front_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_front_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.turn_on, "ON"], [Lang.General.turn_off, "OFF"]]), "STATE").appendField(Lang.Blocks.ALBERT_front_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_front_led = function(b, a) {
  var d = Entry.hw.sendQueue;
  "ON" == a.getField("STATE", a) ? d.frontLed = 1 : d.frontLed = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_beep = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 440;
  d.note = 0;
  var c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(c);
  }, 200);
  Entry.Albert.timeouts.push(c);
  return a;
};
Blockly.Blocks.albert_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_buzzer_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("VALUE");
  d.buzzer = void 0 != d.buzzer ? d.buzzer + c : c;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_buzzer_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = a.getNumberValue("VALUE");
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = 0;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.ALBERT_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.ALBERT_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Albert.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 0;
  d.note = c + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      d.note = 0;
      Entry.Albert.removeTimeout(h);
    }, f - 100);
    Entry.Albert.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(k);
  }, f);
  Entry.Albert.timeouts.push(k);
  return a;
};
Blockly.Blocks.albert_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_rest_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("VALUE"), c = 6E4 * c / Entry.Albert.tempo;
  d.buzzer = 0;
  d.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Albert.removeTimeout(e);
  }, c);
  Entry.Albert.timeouts.push(e);
  return a;
};
Blockly.Blocks.albert_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_tempo_by = function(b, a) {
  Entry.Albert.tempo += a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ALBERT_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_tempo_to = function(b, a) {
  Entry.Albert.tempo = a.getNumberValue("VALUE");
  1 > Entry.Albert.tempo && (Entry.Albert.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.albert_move_forward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_forward = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = 30;
  d.rightWheel = 30;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_move_backward = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_move_backward = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return d.leftWheel = -30, d.rightWheel = -30, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_turn_around = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_around_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_around_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_turn_around = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return d.leftWheel = a.leftValue, d.rightWheel = a.rightValue, a;
    }
    delete a.timeFlag;
    delete a.isStart;
    delete a.leftValue;
    delete a.rightValue;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  d = "LEFT" == a.getField("DIRECTION", a);
  a.leftValue = d ? -30 : 30;
  a.rightValue = d ? 30 : -30;
  a.isStart = !0;
  a.timeFlag = 1;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1E3);
  return a;
};
Blockly.Blocks.albert_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.General.skyblue, "3"], [Lang.General.blue, "1"], [Lang.General.purple, "5"], [Lang.General.white, "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_led_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "FRONT" == c ? (d.leftEye = e, d.rightEye = e) : "LEFT" == c ? d.leftEye = e : d.rightEye = e;
  return a.callReturn();
};
Blockly.Blocks.albert_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.ALBERT_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_clear_led = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a);
  "FRONT" == c ? (d.leftEye = 0, d.rightEye = 0) : "LEFT" == c ? d.leftEye = 0 : d.rightEye = 0;
  return a.callReturn();
};
Blockly.Blocks.albert_change_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheels_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_change_wheels_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData, e = a.getField("DIRECTION"), f = a.getNumberValue("VALUE");
  "LEFT" == e ? d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + f : c.leftWheel + f : ("RIGHT" != e && (d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + f : c.leftWheel + f), d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + f : c.rightWheel + f);
  return a.callReturn();
};
Blockly.Blocks.albert_set_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "FRONT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheels_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.albert_set_wheels_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = e : ("RIGHT" != c && (d.leftWheel = e), d.rightWheel = e);
  return a.callReturn();
};
Entry.Arduino = {name:"arduino", setZero:function() {
  Entry.hw.sendQueue.readablePorts = [];
  for (var b = 0;20 > b;b++) {
    Entry.hw.sendQueue[b] = 0, Entry.hw.sendQueue.readablePorts.push(b);
  }
  Entry.hw.update();
}, monitorTemplate:{imgPath:"hw/arduino.png", width:605, height:434, listPorts:{2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 5:{name:Lang.Hw.port_en + " 5 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 6:{name:Lang.Hw.port_en + " 6 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 7:{name:Lang.Hw.port_en + 
" 7 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 8:{name:Lang.Hw.port_en + " 8 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 9:{name:Lang.Hw.port_en + " 9 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 10:{name:Lang.Hw.port_en + " 10 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 11:{name:Lang.Hw.port_en + " 11 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 12:{name:Lang.Hw.port_en + " 12 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 13:{name:Lang.Hw.port_en + " 13 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a0:{name:Lang.Hw.port_en + " A0 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a1:{name:Lang.Hw.port_en + " A1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a2:{name:Lang.Hw.port_en + " A2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a3:{name:Lang.Hw.port_en + " A3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a4:{name:Lang.Hw.port_en + " A4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, a5:{name:Lang.Hw.port_en + " A5 " + 
Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Entry.SensorBoard = {name:"sensorBoard", setZero:Entry.Arduino.setZero};
Entry.dplay = {name:"dplay", setZero:Entry.Arduino.setZero};
Entry.nemoino = {name:"nemoino", setZero:Entry.Arduino.setZero};
Entry.CODEino = {name:"CODEino", setZero:Entry.Arduino.setZero, monitorTemplate:Entry.Arduino.monitorTemplate};
Blockly.Blocks.arduino_text = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput("Arduino"), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_text = function(b, a) {
  return a.getStringField("NAME");
};
Blockly.Blocks.arduino_send = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_send_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_send = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return a.callReturn();
};
Blockly.Blocks.arduino_get_string = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_string_2);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_number = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return Number(c.responseText);
};
Blockly.Blocks.arduino_get_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_arduino_get_number_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_string = function(b, a) {
  var d = a.getValue("VALUE", a), c = new XMLHttpRequest;
  c.open("POST", "http://localhost:23518/arduino/", !1);
  c.send(String(d));
  Entry.assert(200 == c.status, "arduino is not connected");
  return c.responseText;
};
Blockly.Blocks.arduino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_arduino_get_sensor_number_0, "A0"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_1, "A1"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_2, "A2"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_3, "A3"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_4, "A4"], [Lang.Blocks.ARDUINO_arduino_get_sensor_number_5, "A5"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_pwm_port_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_get_pwm_port_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.arduino_get_number_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.arduino_get_number_sensor_value = function(b, a) {
  var d = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(d[1]);
};
Blockly.Blocks.arduino_get_digital_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_get_digital_value_1);
  this.appendValueInput("VALUE").setCheck("Number");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_sensor_value_2).appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.arduino_get_digital_value = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  return Entry.hw.getDigitalPortValue(d);
};
Blockly.Blocks.arduino_toggle_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_led = function(b, a) {
  var d = a.getNumberValue("VALUE"), c = a.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(d, "on" == c ? 255 : 0);
  return a.callReturn();
};
Blockly.Blocks.arduino_toggle_pwm = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_1);
  this.appendValueInput("PORT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_toggle_pwm_3);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.arduino_toggle_pwm = function(b, a) {
  var d = a.getNumberValue("PORT"), c = a.getNumberValue("VALUE"), c = Math.round(c), c = Math.max(c, 0), c = Math.min(c, 255);
  Entry.hw.setDigitalPortValue(d, c);
  return a.callReturn();
};
Blockly.Blocks.arduino_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_4);
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_6);
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.arduino_convert_scale = function(b, a) {
  var d = a.getNumberValue("VALUE1", a), c = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (c > e) {
    var h = c, c = e, e = h
  }
  f > g && (h = f, f = g, g = h);
  d -= c;
  d *= (g - f) / (e - c);
  d += f;
  d = Math.min(g, d);
  d = Math.max(f, d);
  return Math.round(d);
};
Blockly.Blocks.sensorBoard_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\uc18c\ub9ac", "0"], ["\ube5b \uac10\uc9c0", "1"], ["\uc2ac\ub77c\uc774\ub354", "2"], ["\uc628\ub3c4", "3"]]), "PORT").appendField(" \uc13c\uc11c\uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.sensorBoard_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.sensorBoard_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "8"], ["\ud30c\ub780", "9"], ["\ub178\ub780", "10"], ["\ucd08\ub85d", "11"]]), "PORT");
  this.appendDummyInput().appendField(" \ubc84\ud2bc\uc744 \ub20c\ub800\ub294\uac00?");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.sensorBoard_is_button_pressed = function(b, a) {
  return Entry.hw.getDigitalPortValue(a.getNumberField("PORT", a));
};
Blockly.Blocks.sensorBoard_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["\ube68\uac04", "2"], ["\ucd08\ub85d", "3"], ["\ud30c\ub780", "4"], ["\ud770\uc0c9", "5"]]), "PORT").appendField(" LED").appendField(new Blockly.FieldDropdown([["\ucf1c\uae30", "255"], ["\ub044\uae30", "0"]]), "OPERATOR").appendField(" ").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.sensorBoard_led = function(b, a) {
  Entry.hw.setDigitalPortValue(a.getField("PORT"), a.getNumberField("OPERATOR"));
  return a.callReturn();
};
Entry.block.arduino_download_connector = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download connector");
}]}};
Entry.block.arduino_download_source = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5d4\ud2b8\ub9ac \uc544\ub450\uc774\ub178 \uc18c\uc2a4", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_connected = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\uc5f0\uacb0 \ub428", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Entry.block.arduino_reconnect = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub2e4\uc2dc \uc5f0\uacb0\ud558\uae30", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  console.log("download source");
}]}};
Blockly.Blocks.CODEino_get_sensor_number = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_get_sensor_number_0, "A0"], [Lang.Blocks.CODEino_get_sensor_number_1, "A1"], [Lang.Blocks.CODEino_get_sensor_number_2, "A2"], [Lang.Blocks.CODEino_get_sensor_number_3, "A3"], [Lang.Blocks.CODEino_get_sensor_number_4, "A4"], [Lang.Blocks.CODEino_get_sensor_number_5, "A5"], [Lang.Blocks.CODEino_get_sensor_number_6, "A6"]]), "PORT");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_sensor_number = function(b, a) {
  return a.getStringField("PORT");
};
Blockly.Blocks.CODEino_get_named_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_sensor_name_0, "0"], [Lang.Blocks.CODEino_sensor_name_1, "1"], [Lang.Blocks.CODEino_sensor_name_2, "2"], [Lang.Blocks.CODEino_sensor_name_3, "3"], [Lang.Blocks.CODEino_sensor_name_4, "4"], [Lang.Blocks.CODEino_sensor_name_5, "5"], [Lang.Blocks.CODEino_sensor_name_6, "6"]]), "PORT").appendField(Lang.Blocks.CODEino_string_1);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_named_sensor_value = function(b, a) {
  return Entry.hw.getAnalogPortValue(a.getField("PORT", a));
};
Blockly.Blocks.CODEino_get_sound_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_10).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_11, "GREAT"], [Lang.Blocks.CODEino_string_12, "SMALL"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_sound_status = function(b, a) {
  return "GREAT" == a.getField("STATUS", a) ? 600 < Entry.hw.getAnalogPortValue(0) ? 1 : 0 : 600 > Entry.hw.getAnalogPortValue(0) ? 1 : 0;
};
Blockly.Blocks.CODEino_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_13).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_14, "BRIGHT"], [Lang.Blocks.CODEino_string_15, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.CODEino_is_button_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_3, "4"], [Lang.Blocks.CODEino_string_4, "17"], [Lang.Blocks.CODEino_string_5, "18"], [Lang.Blocks.CODEino_string_6, "19"], [Lang.Blocks.CODEino_string_7, "20"]]), "PORT").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_is_button_pressed = function(b, a) {
  var d = a.getNumberField("PORT", a);
  return 14 < d ? !Entry.hw.getAnalogPortValue(d - 14) : !Entry.hw.getDigitalPortValue(d);
};
Blockly.Blocks.CODEino_get_accelerometer_direction = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_string_16, "LEFT"], [Lang.Blocks.CODEino_string_17, "RIGHT"], [Lang.Blocks.CODEino_string_18, "FRONT"], [Lang.Blocks.CODEino_string_19, "REAR"], [Lang.Blocks.CODEino_string_20, "REVERSE"]]), "DIRECTION");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.CODEino_get_accelerometer_direction = function(b, a) {
  var d = a.getField("DIRECTION", a), c = 0;
  "LEFT" == d || "RIGHT" == d ? c = 3 : "FRONT" == d || "REAR" == d ? c = 4 : "REVERSE" == d && (c = 5);
  c = Entry.hw.getAnalogPortValue(c);
  c = 180 / 137 * (c - 265);
  c += -90;
  c = Math.min(90, c);
  c = Math.max(-90, c);
  c = Math.round(c);
  if ("LEFT" == d || "REAR" == d) {
    return -30 > c ? 1 : 0;
  }
  if ("RIGHT" == d || "FRONT" == d) {
    return 30 < c ? 1 : 0;
  }
  if ("REVERSE" == d) {
    return -50 > c ? 1 : 0;
  }
};
Blockly.Blocks.CODEino_get_accelerometer_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.CODEino_string_8).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CODEino_accelerometer_X, "3"], [Lang.Blocks.CODEino_accelerometer_Y, "4"], [Lang.Blocks.CODEino_accelerometer_Z, "5"]]), "PORT").appendField(Lang.Blocks.CODEino_string_9);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.CODEino_get_accelerometer_value = function(b, a) {
  var d = 265, c = 402, e = -90, f = 90, g = Entry.hw.getAnalogPortValue(a.getField("PORT", a));
  if (d > c) {
    var h = d, d = c, c = h
  }
  e > f && (h = e, e = f, f = h);
  g = (f - e) / (c - d) * (g - d);
  g += e;
  g = Math.min(f, g);
  g = Math.max(e, g);
  return Math.round(g);
};
Blockly.Blocks.dplay_select_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.ARDUINO_on, "on"], [Lang.Blocks.ARDUINO_off, "off"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_select_led = function(b, a) {
  var d = a.getField("PORT"), c = 7;
  "7" == d ? c = 7 : "8" == d ? c = 8 : "9" == d ? c = 9 : "10" == d && (c = 10);
  d = a.getField("OPERATOR");
  Entry.hw.setDigitalPortValue(c, "on" == d ? 255 : 0);
  return a.callReturn();
};
Blockly.Blocks.dplay_get_switch_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ub514\uc9c0\ud138 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["2", "2"], ["4", "4"]]), "PORT");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_5, "ON"], [Lang.Blocks.dplay_string_6, "OFF"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_switch_status = function(b, a) {
  var d = a.getField("PORT"), c = 2;
  "2" == d ? c = 2 : "4" == d && (c = 4);
  return "OFF" == a.getField("STATUS") ? 1 == Entry.hw.getDigitalPortValue(c) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(c) ? 1 : 0;
};
Blockly.Blocks.dplay_get_light_status = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_light).appendField(new Blockly.FieldDropdown([[Lang.Blocks.dplay_string_3, "BRIGHT"], [Lang.Blocks.dplay_string_4, "DARK"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_light_status = function(b, a) {
  return "DARK" == a.getField("STATUS", a) ? 800 < Entry.hw.getAnalogPortValue(1) ? 1 : 0 : 800 > Entry.hw.getAnalogPortValue(1) ? 1 : 0;
};
Blockly.Blocks.dplay_get_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc88 ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uac00\ubcc0\uc800\ud56d", "ADJU"], ["\ube5b\uc13c\uc11c", "LIGHT"], ["\uc628\ub3c4\uc13c\uc11c", "TEMP"], ["\uc870\uc774\uc2a4\ud2f1 X", "JOYS"], ["\uc870\uc774\uc2a4\ud2f1 Y", "JOYS"], ["\uc801\uc678\uc120", "INFR"]]), "OPERATOR");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_num_pin_5);
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.dplay_get_value = function(b, a) {
  var d = a.getValue("VALUE", a);
  return Entry.hw.getAnalogPortValue(d[1]);
};
Blockly.Blocks.dplay_get_tilt = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.dplay_tilt).appendField(new Blockly.FieldDropdown([["\uc67c\ucabd \uae30\uc6b8\uc784", "LEFT"], ["\uc624\ub978\ucabd \uae30\uc6b8\uc784", "LIGHT"]]), "STATUS").appendField(" ");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.dplay_get_tilt = function(b, a) {
  return "LIGHT" == a.getField("STATUS", a) ? 1 == Entry.hw.getDigitalPortValue(12) ? 1 : 0 : 0 == Entry.hw.getDigitalPortValue(12) ? 1 : 0;
};
Blockly.Blocks.dplay_DCmotor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc67c\ucabd", "3"], ["\uc624\ub978\ucabd", "6"]]), "PORT");
  this.appendDummyInput().appendField(" DC\ubaa8\ud130 \uc0c1\ud0dc\ub97c");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\uc815\ubc29\ud5a5", "FRONT"], ["\uc5ed\ubc29\ud5a5", "REAR"], ["\uc815\uc9c0", "OFF"]]), "OPERATOR").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_DCmotor = function(b, a) {
  var d = a.getField("PORT"), c = 0;
  "3" == d && (c = 5);
  var e = a.getField("OPERATOR"), f = 0, g = 0;
  "FRONT" == e ? (f = 255, g = 0) : "REAR" == e ? (f = 0, g = 255) : "OFF" == e && (g = f = 0);
  Entry.hw.setDigitalPortValue(d, f);
  Entry.hw.setDigitalPortValue(c, g);
  return a.callReturn();
};
Blockly.Blocks.dplay_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubd80\uc800\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["\ub3c4", "1"], ["\ub808", "2"], ["\ubbf8", "3"]]), "PORT");
  this.appendDummyInput().appendField("\ub85c");
  this.appendValueInput("VALUE").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\ubc15\uc790\ub85c \uc5f0\uc8fc\ud558\uae30");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_buzzer = function(b, a) {
  var d = a.getField("PORT"), c = 2;
  "1" == d ? c = 2 : "2" == d ? c = 4 : "3" == d && (c = 7);
  d = a.getNumberValue("VALUE");
  d = Math.round(d);
  d = Math.max(d, 0);
  d = Math.min(d, 100);
  Entry.hw.setDigitalPortValue(c, d);
  return a.callReturn();
};
Blockly.Blocks.dplay_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4\ubaa8\ud130 \uac01\ub3c4\ub97c");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc774\ub3d9");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.dplay_servo = function(b, a) {
  var d = a.getNumberValue("VALUE"), d = Math.round(d), d = Math.max(d, 0), d = Math.min(d, 180);
  Entry.hw.setDigitalPortValue(9, d);
  return a.callReturn();
};
Entry.Bitbrick = {SENSOR_MAP:{1:"light", 2:"IR", 3:"touch", 4:"potentiometer", 5:"MIC", 21:"UserSensor", 11:"USER INPUT", 20:"LED", 19:"SERVO", 18:"DC"}, PORT_MAP:{buzzer:2, 5:4, 6:6, 7:8, 8:10, LEDR:12, LEDG:14, LEDB:16}, sensorList:function() {
  for (var b = [], a = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = a[d];
    c && (c.value || 0 === c.value) && b.push([d + " - " + Lang.Blocks["BITBRICK_" + c.type], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, touchList:function() {
  for (var b = [], a = Entry.hw.portData, d = 1;5 > d;d++) {
    var c = a[d];
    c && "touch" === c.type && b.push([d.toString(), d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, servoList:function() {
  for (var b = [], a = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = a[d];
    c && "SERVO" === c.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, dcList:function() {
  for (var b = [], a = Entry.hw.portData, d = 5;9 > d;d++) {
    var c = a[d];
    c && "DC" === c.type && b.push(["ABCD"[d - 5], d.toString()]);
  }
  return 0 == b.length ? [[Lang.Blocks.no_target, "null"]] : b;
}, setZero:function() {
  var b = Entry.hw.sendQueue, a;
  for (a in Entry.Bitbrick.PORT_MAP) {
    b[a] = 0;
  }
  Entry.hw.update();
}, name:"bitbrick", servoMaxValue:181, servoMinValue:1, dcMaxValue:100, dcMinValue:-100, monitorTemplate:{imgPath:"hw/bitbrick.png", width:400, height:400, listPorts:{1:{name:Lang.Hw.port_en + " 1 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 2:{name:Lang.Hw.port_en + " 2 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 3:{name:Lang.Hw.port_en + " 3 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, 4:{name:Lang.Hw.port_en + " 4 " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, A:{name:Lang.Hw.port_en + 
" A " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, B:{name:Lang.Hw.port_en + " B " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, C:{name:Lang.Hw.port_en + " C " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}, D:{name:Lang.Hw.port_en + " D " + Lang.Hw.port_ko, type:"input", pos:{x:0, y:0}}}, mode:"both"}};
Blockly.Blocks.bitbrick_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT").appendField(" \uac12");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_sensor_value = function(b, a) {
  var d = a.getStringField("PORT");
  return Entry.hw.portData[d].value;
};
Blockly.Blocks.bitbrick_is_touch_pressed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.BITBRICK_touch).appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.touchList), "PORT").appendField("\uc774(\uac00) \ub20c\ub838\ub294\uac00?");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_is_touch_pressed = function(b, a) {
  return 0 === Entry.hw.portData[a.getStringField("PORT")].value;
};
Blockly.Blocks.bitbrick_turn_off_color_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_color_led = function(b, a) {
  Entry.hw.sendQueue.LEDR = 0;
  Entry.hw.sendQueue.LEDG = 0;
  Entry.hw.sendQueue.LEDB = 0;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 R");
  this.appendValueInput("rValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("G");
  this.appendValueInput("gValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("B");
  this.appendValueInput("bValue").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_rgb = function(b, a) {
  var d = a.getNumberValue("rValue"), c = a.getNumberValue("gValue"), e = a.getNumberValue("bValue"), f = Entry.adjustValueWithMaxMin, g = Entry.hw.sendQueue;
  g.LEDR = f(d, 0, 255);
  g.LEDG = f(c, 0, 255);
  g.LEDB = f(e, 0, 255);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \uc0c9 ").appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_picker = function(b, a) {
  var d = a.getStringField("VALUE");
  Entry.hw.sendQueue.LEDR = parseInt(d.substr(1, 2), 16);
  Entry.hw.sendQueue.LEDG = parseInt(d.substr(3, 2), 16);
  Entry.hw.sendQueue.LEDB = parseInt(d.substr(5, 2), 16);
  return a.callReturn();
};
Blockly.Blocks.bitbrick_turn_on_color_led_by_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uceec\ub7ec LED \ucf1c\uae30 \uc0c9");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub85c \uc815\ud558\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_on_color_led_by_value = function(b, a) {
  var d = a.getNumberValue("VALUE"), c, e, f, d = d % 200;
  67 > d ? (c = 200 - 3 * d, e = 3 * d, f = 0) : 134 > d ? (d -= 67, c = 0, e = 200 - 3 * d, f = 3 * d) : 201 > d && (d -= 134, c = 3 * d, e = 0, f = 200 - 3 * d);
  Entry.hw.sendQueue.LEDR = c;
  Entry.hw.sendQueue.LEDG = e;
  Entry.hw.sendQueue.LEDB = f;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubc84\uc800\uc74c ");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_buzzer = function(b, a) {
  if (a.isStart) {
    return Entry.hw.sendQueue.buzzer = 0, delete a.isStart, a.callReturn();
  }
  var d = a.getNumberValue("VALUE");
  Entry.hw.sendQueue.buzzer = d;
  a.isStart = !0;
  return a;
};
Blockly.Blocks.bitbrick_turn_off_all_motors = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubaa8\ub4e0 \ubaa8\ud130 \ub044\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.bitbrick_turn_off_all_motors = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.Bitbrick;
  c.servoList().map(function(a) {
    d[a[1]] = 0;
  });
  c.dcList().map(function(a) {
    d[a[1]] = 128;
  });
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" \uc18d\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_speed = function(b, a) {
  var d = a.getNumberValue("VALUE"), d = Math.min(d, Entry.Bitbrick.dcMaxValue), d = Math.max(d, Entry.Bitbrick.dcMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d + 128;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_dc_direction_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("DC \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.dcList), "PORT").appendField(" ").appendField(new Blockly.FieldDropdown([[Lang.Blocks.BITBRICK_dc_direction_cw, "CW"], [Lang.Blocks.BITBRICK_dc_direction_ccw, "CCW"]]), "DIRECTION").appendField(" \ubc29\ud5a5").appendField(" \uc18d\ub825");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_dc_direction_speed = function(b, a) {
  var d = "CW" === a.getStringField("DIRECTION"), c = a.getNumberValue("VALUE"), c = Math.min(c, Entry.Bitbrick.dcMaxValue), c = Math.max(c, 0);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d ? c + 128 : 128 - c;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_servomotor_angle = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc11c\ubcf4 \ubaa8\ud130").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.servoList), "PORT").appendField(" \uac01\ub3c4");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_servomotor_angle = function(b, a) {
  var d = a.getNumberValue("VALUE") + 1, d = Math.min(d, Entry.Bitbrick.servoMaxValue), d = Math.max(d, Entry.Bitbrick.servoMinValue);
  Entry.hw.sendQueue[a.getStringField("PORT")] = d;
  return a.callReturn();
};
Blockly.Blocks.bitbrick_convert_scale = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\ubcc0\ud658");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdownDynamic(Entry.Bitbrick.sensorList), "PORT");
  this.appendDummyInput().appendField("\uac12");
  this.appendValueInput("VALUE2").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField("\uc5d0\uc11c");
  this.appendValueInput("VALUE4").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.ARDUINO_convert_scale_5);
  this.appendValueInput("VALUE5").setCheck(["Number", "String", null]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.bitbrick_convert_scale = function(b, a) {
  var d = a.getNumberField("PORT"), c = Entry.hw.portData[d].value, d = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a), f = a.getNumberValue("VALUE4", a), g = a.getNumberValue("VALUE5", a);
  if (f > g) {
    var h = f, f = g, g = h
  }
  c -= d;
  c *= (g - f) / (e - d);
  c += f;
  c = Math.min(g, c);
  c = Math.max(f, c);
  return Math.round(c);
};
var categoryColor = "#FF9E20";
Blockly.Blocks.start_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_start_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.start_drawing()"]}};
Entry.block.start_drawing = function(b, a) {
  b.brush ? b.brush.stop = !1 : Entry.setBasicBrush(b);
  Entry.stage.sortZorder();
  b.brush.moveTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.stop_drawing = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stop_drawing).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.stop_drawing()"]}};
Entry.block.stop_drawing = function(b, a) {
  b.brush && b.shape && (b.brush.stop = !0);
  return a.callReturn();
};
Blockly.Blocks.set_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_1);
  this.appendDummyInput().appendField(new Blockly.FieldColour("#ff0000"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_color_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_color(%1)"]}};
Entry.block.set_color = function(b, a) {
  var d = a.getField("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (d = Entry.hex2rgb(d), b.brush.rgb = d, b.brush.endStroke(), b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_random_color = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_random_color).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_color_random()"]}};
Entry.block.set_random_color = function(b, a) {
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  if (b.brush) {
    var d = Entry.generateRgb();
    b.brush.rgb = d;
    b.brush.endStroke();
    b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + b.brush.opacity / 100 + ")");
    b.brush.moveTo(b.getX(), -1 * b.getY());
  }
  return a.callReturn();
};
Blockly.Blocks.change_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_thickness(%1)"]}};
Entry.block.change_thickness = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness += d, 1 > b.brush.thickness && (b.brush.thickness = 1), b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_thickness = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_thickness_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_thickness(%1)"]}};
Entry.block.set_thickness = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.thickness = d, b.brush.setStrokeStyle(b.brush.thickness), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.change_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_opacity(%1)"]}};
Entry.block.change_opacity = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  d = Entry.adjustValueWithMaxMin(b.brush.opacity + d, 0, 100);
  b.brush && (b.brush.opacity = d, b.brush.endStroke(), d = b.brush.rgb, b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_opacity = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_opacity_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_opacity(%1)"]}};
Entry.block.set_opacity = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(d, 0, 100), b.brush.endStroke(), d = b.brush.rgb, b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.brush_erase_all = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_brush_erase_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.erase_all_brush()"]}};
Entry.block.brush_erase_all = function(b, a) {
  var d = b.brush;
  if (d) {
    var c = d._stroke.style, e = d._strokeStyle.width;
    d.clear().setStrokeStyle(e).beginStroke(c);
    d.moveTo(b.getX(), -1 * b.getY());
  }
  d = b.parent.getStampEntities();
  d.map(function(a) {
    a.removeClone();
  });
  d = null;
  return a.callReturn();
};
Blockly.Blocks.brush_stamp = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_stamp).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.stamp()"]}};
Entry.block.brush_stamp = function(b, a) {
  b.parent.addStampEntity(b);
  return a.callReturn();
};
Blockly.Blocks.change_brush_transparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_change_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_brush_transparency_by_percent(%1)"]}};
Entry.block.change_brush_transparency = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  d = Entry.adjustValueWithMaxMin(b.brush.opacity - d, 0, 100);
  b.brush && (b.brush.opacity = d, b.brush.endStroke(), d = b.brush.rgb, b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + b.brush.opacity / 100 + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
Blockly.Blocks.set_brush_tranparency = {init:function() {
  this.setColour(categoryColor);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_1);
  this.appendValueInput("VALUE").setCheck(["Number", "Boolean"]);
  this.appendDummyInput().appendField(Lang.Blocks.BRUSH_set_brush_transparency_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/brush_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_brush_transparency_by_percent(%1)"]}};
Entry.block.set_brush_tranparency = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.brush || (Entry.setBasicBrush(b), b.brush.stop = !0);
  b.brush && (b.brush.opacity = Entry.adjustValueWithMaxMin(d, 0, 100), b.brush.endStroke(), d = b.brush.rgb, b.brush.beginStroke("rgba(" + d.r + "," + d.g + "," + d.b + "," + (1 - b.brush.opacity / 100) + ")"), b.brush.moveTo(b.getX(), -1 * b.getY()));
  return a.callReturn();
};
var calcArrowColor = "#e8b349", calcBlockColor = "#FFD974", calcFontColor = "#3D3D3D";
Blockly.Blocks.number = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "NUM");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1"]}};
Entry.block.number = function(b, a) {
  return a.getField("NUM", a);
};
Blockly.Blocks.angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "ANGLE");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:[" %1 "]}};
Entry.block.angle = function(b, a) {
  return a.getNumberField("ANGLE");
};
Blockly.Blocks.get_x_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_x_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_x()"]}};
Entry.block.get_x_coordinate = function(b, a) {
  return b.getX();
};
Blockly.Blocks.get_y_coordinate = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_y_coordinate, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_y()"]}};
Entry.block.get_y_coordinate = function(b, a) {
  return b.getY();
};
Blockly.Blocks.get_angle = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_angle, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.get_angle = function(b, a) {
  return parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.get_rotation_direction = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_rotation_value, "ROTATION"], [Lang.Blocks.CALC_direction_value, "DIRECTION"]], null, !0, calcArrowColor), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_direction()"]}};
Entry.block.get_rotation_direction = function(b, a) {
  return "DIRECTION" == a.getField("OPERATOR", a).toUpperCase() ? parseFloat(b.getDirection().toFixed(1)) : parseFloat(b.getRotation().toFixed(1));
};
Blockly.Blocks.distance_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_distance_something_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_distance_something_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_distance(%1)"]}};
Entry.block.distance_something = function(b, a) {
  var d = a.getField("VALUE", a);
  if ("mouse" == d) {
    return d = Entry.stage.mouseCoordinate, Math.sqrt(Math.pow(b.getX() - d.x, 2) + Math.pow(b.getY() - d.y, 2));
  }
  d = Entry.container.getEntity(d);
  return Math.sqrt(Math.pow(b.getX() - d.getX(), 2) + Math.pow(b.getY() - d.getY(), 2));
};
Blockly.Blocks.coordinate_mouse = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_mouse_1, calcFontColor).appendField(new Blockly.FieldDropdown([["x", "x"], ["y", "y"]], null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_mouse_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_mouse_coordinate("%1")']}};
Entry.block.coordinate_mouse = function(b, a) {
  return "x" === a.getField("VALUE", a) ? Number(Entry.stage.mouseCoordinate.x) : Number(Entry.stage.mouseCoordinate.y);
};
Blockly.Blocks.coordinate_object = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_coordinate_object_1, calcFontColor).appendField(new Blockly.FieldDropdownDynamic("spritesWithSelf", null, !0, calcArrowColor), "VALUE").appendField(Lang.Blocks.CALC_coordinate_object_2, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_coordinate_x_value, "x"], [Lang.Blocks.CALC_coordinate_y_value, "y"], [Lang.Blocks.CALC_coordinate_rotation_value, "rotation"], [Lang.Blocks.CALC_coordinate_direction_value, "direction"], 
  [Lang.Blocks.CALC_coordinate_size_value, "size"], [Lang.Blocks.CALC_picture_index, "picture_index"], [Lang.Blocks.CALC_picture_name, "picture_name"]], null, !0, calcArrowColor), "COORDINATE").appendField(Lang.Blocks.CALC_coordinate_object_3, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_object_coordinate("%1", "%2")']}};
Entry.block.coordinate_object = function(b, a) {
  var d = a.getField("VALUE", a), d = "self" == d ? b : Entry.container.getEntity(d);
  switch(a.getField("COORDINATE", a)) {
    case "x":
      return d.getX();
    case "y":
      return d.getY();
    case "rotation":
      return d.getRotation();
    case "direction":
      return d.getDirection();
    case "picture_index":
      var c = d.parent, c = c.pictures;
      return c.indexOf(d.picture) + 1;
    case "size":
      return Number(d.getSize().toFixed(1));
    case "picture_name":
      return c = d.parent, c = c.pictures, c[c.indexOf(d.picture)].name;
  }
};
Blockly.Blocks.calc_basic = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["x", "MULTI"], ["/", "DIVIDE"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1 %2 %3"]}};
Entry.block.calc_basic = function(b, a) {
  var d = a.getField("OPERATOR", a), c = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "PLUS" == d ? c + e : "MINUS" == d ? c - e : "MULTI" == d ? c * e : c / e;
};
Blockly.Blocks.calc_plus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("+", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_plus = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d + c;
};
Blockly.Blocks.calc_minus = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("-", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_minus = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d - c;
};
Blockly.Blocks.calc_times = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("x", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_times = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d * c;
};
Blockly.Blocks.calc_divide = {init:function() {
  this.setColour(calcBlockColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("/", calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.calc_divide = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d / c;
};
Blockly.Blocks.calc_mod = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_mod_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_mod_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_mod = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d % c;
};
Blockly.Blocks.calc_share = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_share_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_share_3, calcFontColor);
  this.setInputsInline(!0);
}};
Entry.block.calc_share = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return Math.floor(d / c);
};
Blockly.Blocks.calc_operation = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_operation_of_2, calcFontColor);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_calc_operation_square, "square"], [Lang.Blocks.CALC_calc_operation_root, "root"], [Lang.Blocks.CALC_calc_operation_sin, "sin"], [Lang.Blocks.CALC_calc_operation_cos, "cos"], [Lang.Blocks.CALC_calc_operation_tan, "tan"], [Lang.Blocks.CALC_calc_operation_asin, "asin_radian"], [Lang.Blocks.CALC_calc_operation_acos, "acos_radian"], [Lang.Blocks.CALC_calc_operation_atan, "atan_radian"], [Lang.Blocks.CALC_calc_operation_log, 
  "log"], [Lang.Blocks.CALC_calc_operation_ln, "ln"], [Lang.Blocks.CALC_calc_operation_unnatural, "unnatural"], [Lang.Blocks.CALC_calc_operation_floor, "floor"], [Lang.Blocks.CALC_calc_operation_ceil, "ceil"], [Lang.Blocks.CALC_calc_operation_round, "round"], [Lang.Blocks.CALC_calc_operation_factorial, "factorial"], [Lang.Blocks.CALC_calc_operation_abs, "abs"]], null, !0, calcArrowColor), "VALUE");
  this.setOutput(!0, "Number");
  this.appendDummyInput().appendField(" ");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.calculate(%1, "%2")']}};
Entry.block.calc_operation = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getField("VALUE", a);
  if (-1 < ["asin_radian", "acos_radian"].indexOf(c) && (1 < d || -1 > d)) {
    throw Error("x range exceeded");
  }
  c.indexOf("_") && (c = c.split("_")[0]);
  -1 < ["sin", "cos", "tan"].indexOf(c) && (d = Entry.toRadian(d));
  var e = 0;
  switch(c) {
    case "square":
      e = d * d;
      break;
    case "factorial":
      e = Entry.factorial(d);
      break;
    case "root":
      e = Math.sqrt(d);
      break;
    case "log":
      e = Math.log(d) / Math.LN10;
      break;
    case "ln":
      e = Math.log(d);
      break;
    case "asin":
    ;
    case "acos":
    ;
    case "atan":
      e = Entry.toDegrees(Math[c](d));
      break;
    case "unnatural":
      e = d - Math.floor(d);
      0 > d && (e = 1 - e);
      break;
    default:
      e = Math[c](d);
  }
  return Math.round(1E3 * e) / 1E3;
};
Blockly.Blocks.calc_rand = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_calc_rand_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_calc_rand_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:["random.randrange(%1, %2)"]}};
Entry.block.calc_rand = function(b, a) {
  var d = a.getStringValue("LEFTHAND", a), c = a.getStringValue("RIGHTHAND", a), e = Math.min(d, c), f = Math.max(d, c), d = Entry.isFloat(d);
  return Entry.isFloat(c) || d ? (Math.random() * (f - e) + e).toFixed(2) : Math.floor(Math.random() * (f - e + 1) + e);
};
Blockly.Blocks.get_date = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_date_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_get_date_year, "YEAR"], [Lang.Blocks.CALC_get_date_month, "MONTH"], [Lang.Blocks.CALC_get_date_day, "DAY"], [Lang.Blocks.CALC_get_date_hour, "HOUR"], [Lang.Blocks.CALC_get_date_minute, "MINUTE"], [Lang.Blocks.CALC_get_date_second, "SECOND"]], null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.CALC_get_date_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_date_time("%1")']}};
Entry.block.get_date = function(b, a) {
  var d = a.getField("VALUE", a), c = new Date;
  return "YEAR" == d ? c.getFullYear() : "MONTH" == d ? c.getMonth() + 1 : "DAY" == d ? c.getDate() : "HOUR" == d ? c.getHours() : "MINUTE" == d ? c.getMinutes() : c.getSeconds();
};
Blockly.Blocks.get_sound_duration = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds", null, !0, calcArrowColor), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_duration_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_sound_duration(%1)"]}};
Entry.block.get_sound_duration = function(b, a) {
  for (var d = a.getField("VALUE", a), c = b.parent.sounds, e = 0;e < c.length;e++) {
    if (c[e].id == d) {
      return c[e].duration;
    }
  }
};
Blockly.Blocks.reset_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_reset, calcFontColor);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}};
Entry.block.reset_project_timer = function(b, a) {
  Entry.engine.updateProjectTimer(0);
  return a.callReturn();
};
Blockly.Blocks.set_visible_project_timer = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_1, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]], null, !0, calcArrowColor), "ACTION");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_timer_visible_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}, syntax:{js:[], py:['Entry.show_timer("%1")']}};
Entry.block.set_visible_project_timer = function(b, a) {
  var d = a.getField("ACTION", a), c = Entry.engine.projectTimer;
  "SHOW" == d ? c.setVisible(!0) : c.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.timer_variable = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.timer_variable = function(b, a) {
  return Entry.container.inputValue.getValue();
};
Blockly.Blocks.get_project_timer_value = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_timer_value, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}, syntax:{js:[], py:["Entry.get_timer_value()"]}};
Entry.block.get_project_timer_value = function(b, a) {
  return Entry.engine.projectTimer.getValue();
};
Blockly.Blocks.char_at = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_char_at_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_char_at_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1"[%2]']}};
Entry.block.char_at = function(b, a) {
  var d = a.getStringValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a) - 1;
  if (0 > c || c > d.length - 1) {
    throw Error();
  }
  return d[c];
};
Blockly.Blocks.length_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_length_of_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_length_of_string_2, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["len(%1)"]}};
Entry.block.length_of_string = function(b, a) {
  return a.getStringValue("STRING", a).length;
};
Blockly.Blocks.substring = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_substring_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_2, calcFontColor);
  this.appendValueInput("START").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_3, calcFontColor);
  this.appendValueInput("END").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_substring_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1"[%2:%3]']}};
Entry.block.substring = function(b, a) {
  var d = a.getStringValue("STRING", a), c = a.getNumberValue("START", a) - 1, e = a.getNumberValue("END", a) - 1, f = d.length - 1;
  if (0 > c || 0 > e || c > f || e > f) {
    throw Error();
  }
  return d.substring(Math.min(c, e), Math.max(c, e) + 1);
};
Blockly.Blocks.replace_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_replace_string_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_2, calcFontColor);
  this.appendValueInput("OLD_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_3, calcFontColor);
  this.appendValueInput("NEW_WORD").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_replace_string_4, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1".replace("%2", "%3")']}};
Entry.block.replace_string = function(b, a) {
  return a.getStringValue("STRING", a).replace(new RegExp(a.getStringValue("OLD_WORD", a), "gm"), a.getStringValue("NEW_WORD", a));
};
Blockly.Blocks.change_string_case = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_1, calcFontColor);
  this.appendValueInput("STRING").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_2, calcFontColor);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_change_string_case_sub_1, "toUpperCase"], [Lang.Blocks.CALC_change_string_case_sub_2, "toLowerCase"]], null, !0, calcArrowColor), "CASE");
  this.appendDummyInput().appendField(Lang.Blocks.CALC_change_string_case_3, calcFontColor);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.change_string_case("%1", "%2")']}};
Entry.block.change_string_case = function(b, a) {
  return a.getStringValue("STRING", a)[a.getField("CASE", a)]();
};
Blockly.Blocks.index_of_string = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_index_of_string_1, calcFontColor);
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_2, calcFontColor);
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Number");
  this.appendDummyInput("VALUE").appendField(Lang.Blocks.CALC_index_of_string_3, calcFontColor);
  this.setInputsInline(!0);
}, syntax:{js:[], py:['"%1".index(%2)']}};
Entry.block.index_of_string = function(b, a) {
  var d = a.getStringValue("LEFTHAND", a), c = a.getStringValue("RIGHTHAND", a), d = d.indexOf(c);
  return -1 < d ? d + 1 : 0;
};
Blockly.Blocks.combine_something = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_1, calcFontColor);
  this.appendValueInput("VALUE1").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_2, calcFontColor);
  this.appendValueInput("VALUE2").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_combine_something_3, calcFontColor);
  this.setInputsInline(!0);
  this.setOutput(!0, "String");
}, syntax:{js:[], py:['"%1".index(%2)']}};
Entry.block.combine_something = function(b, a) {
  var d = a.getStringValue("VALUE1", a), c = a.getStringValue("VALUE2", a);
  return d + c;
};
Blockly.Blocks.get_sound_volume = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_get_sound_volume, calcFontColor).appendField(" ", calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.get_sound_volume()"]}};
Entry.block.get_sound_volume = function(b, a) {
  return 100 * createjs.Sound.getVolume();
};
Blockly.Blocks.quotient_and_mod = {init:function() {
  this.setColour(calcBlockColor);
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, 
  "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR")) : "en" == Lang.type && (this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_quotient_and_mod_sub_1, "QUOTIENT"], [Lang.Blocks.CALC_quotient_and_mod_sub_2, "MOD"]], null, !0, calcArrowColor), "OPERATOR"), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_2, calcFontColor), this.appendValueInput("LEFTHAND").setCheck(["Number", 
  "String"]), this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_3, calcFontColor), this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]));
  this.appendDummyInput().appendField(Lang.Blocks.CALC_quotient_and_mod_4, calcFontColor);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, syntax:{js:[], py:['Entry.get_quotient_remainder(%1, %2, "%3"']}};
Entry.block.quotient_and_mod = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  if (isNaN(d) || isNaN(c)) {
    throw Error();
  }
  return "QUOTIENT" == a.getField("OPERATOR", a) ? Math.floor(d / c) : d % c;
};
Blockly.Blocks.choose_project_timer_action = {init:function() {
  this.setColour(calcBlockColor);
  this.appendDummyInput().appendField(Lang.Blocks.CALC_choose_project_timer_action_1, calcFontColor).appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_choose_project_timer_action_sub_1, "START"], [Lang.Blocks.CALC_choose_project_timer_action_sub_2, "STOP"], [Lang.Blocks.CALC_choose_project_timer_action_sub_3, "RESET"]], null, !0, calcArrowColor), "ACTION").appendField(Lang.Blocks.CALC_choose_project_timer_action_2, calcFontColor).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/calc_01.png", 
  "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.engine && Entry.engine.showProjectTimer();
}, whenRemove:function(b) {
  Entry.engine && Entry.engine.hideProjectTimer(b);
}, syntax:{js:[], py:['Entry.act_timer("%1")']}};
Entry.block.choose_project_timer_action = function(b, a) {
  var d = a.getField("ACTION"), c = Entry.engine, e = c.projectTimer;
  "START" == d ? e.isInit ? e.isInit && e.isPaused && (e.pauseStart && (e.pausedTime += (new Date).getTime() - e.pauseStart), delete e.pauseStart, e.isPaused = !1) : c.startProjectTimer() : "STOP" == d ? e.isInit && !e.isPaused && (e.isPaused = !0, e.pauseStart = (new Date).getTime()) : "RESET" == d && e.isInit && (e.setValue(0), e.start = (new Date).getTime(), e.pausedTime = 0, delete e.pauseStart);
  return a.callReturn();
};
Blockly.Blocks.wait_second = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_1);
  this.appendValueInput("SECOND").setCheck(["Number", "String", null]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_second_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.wait_seconds(%1)"]}};
Entry.block.wait_second = function(b, a) {
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var d = a.getNumberValue("SECOND", a);
  setTimeout(function() {
    a.timeFlag = 0;
  }, 60 / (Entry.FPS || 60) * d * 1E3);
  return a;
};
Blockly.Blocks.repeat_basic = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_basic_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["for i in range(%1):\n$1"]}};
Entry.block.repeat_basic = function(b, a) {
  var d;
  if (!a.isLooped) {
    a.isLooped = !0;
    d = a.getNumberValue("VALUE", a);
    if (0 > d) {
      throw Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
    }
    a.iterCount = Math.floor(d);
  }
  if (0 == a.iterCount || 0 > a.iterCount) {
    return delete a.isLooped, delete a.iterCount, a.callReturn();
  }
  a.iterCount--;
  return a.getStatement("DO", a);
};
Blockly.Blocks.repeat_inf = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_inf).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["while True:\n$1"]}};
Entry.block.repeat_inf = function(b, a) {
  a.isLooped = !0;
  return a.getStatement("DO");
};
Blockly.Blocks.stop_repeat = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_repeat).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["break"]}};
Entry.block.stop_repeat = function(b, a) {
  return this.executor.break();
};
Blockly.Blocks.wait_until_true = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_wait_until_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.wait_for_true(%1)"]}};
Entry.block.wait_until_true = function(b, a) {
  return a.getBooleanValue("BOOL", a) ? a.callReturn() : a;
};
Blockly.Blocks._if = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW__if_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["if %1:\n$1"]}};
Entry.block._if = function(b, a) {
  return a.isLooped ? (delete a.isLooped, a.callReturn()) : a.getBooleanValue("BOOL", a) ? (a.isLooped = !0, a.getStatement("STACK", a)) : a.callReturn();
};
Blockly.Blocks.if_else = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_1);
  this.appendValueInput("BOOL").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.appendStatementInput("STACK_IF");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_if_else_3);
  this.appendStatementInput("STACK_ELSE");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["if %1:\n$1\nelse:\n$2"]}};
Entry.block.if_else = function(b, a) {
  if (a.isLooped) {
    return delete a.isLooped, a.callReturn();
  }
  var d = a.getBooleanValue("BOOL", a);
  a.isLooped = !0;
  return d ? a.getStatement("STACK_IF", a) : a.getStatement("STACK_ELSE", a);
};
Blockly.Blocks.create_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("clone"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_create_clone_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.create_clone(%1)"]}};
Entry.block.create_clone = function(b, a) {
  var d = a.getField("VALUE", a), c = a.callReturn();
  "self" == d ? b.parent.addCloneEntity(b.parent, b, null) : Entry.container.getObject(d).addCloneEntity(b.parent, null, null);
  return c;
};
Blockly.Blocks.delete_clone = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["self.remove_clone()"]}};
Entry.block.delete_clone = function(b, a) {
  if (!b.isClone) {
    return a.callReturn();
  }
  b.removeClone();
};
Blockly.Blocks.when_clone_start = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_clone.png", "*", "start")).appendField(Lang.Blocks.FLOW_when_clone_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_clone_create()"]}};
Entry.block.when_clone_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.stop_run = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_run).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.stop_run = function(b, a) {
  return Entry.engine.toggleStop();
};
Blockly.Blocks.repeat_while_true = {init:function() {
  this.setColour("#498deb");
  "ko" == Lang.type ? (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION").appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"))) : (this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_1), 
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_repeat_while_true_until, "until"], [Lang.Blocks.FLOW_repeat_while_true_while, "while"]]), "OPTION"), this.appendValueInput("BOOL").setCheck("Boolean"), this.appendDummyInput().appendField(Lang.Blocks.FLOW_repeat_while_true_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*")));
  this.appendStatementInput("DO");
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["particular block"]}};
Entry.block.repeat_while_true = function(b, a) {
  var d = a.getBooleanValue("BOOL", a);
  "until" == a.getField("OPTION", a) && (d = !d);
  return (a.isLooped = d) ? a.getStatement("DO", a) : a.callReturn();
};
Blockly.Blocks.stop_object = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.FLOW_stop_object_all, "all"], [Lang.Blocks.FLOW_stop_object_this_object, "thisOnly"], [Lang.Blocks.FLOW_stop_object_this_thread, "thisThread"], [Lang.Blocks.FLOW_stop_object_other_thread, "otherThread"]]), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_stop_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.stop(%1)"]}};
Entry.block.stop_object = function(b, a) {
  var d = a.getField("TARGET", a), c = Entry.container;
  switch(d) {
    case "all":
      return c.clearRunningState(), this.die();
    case "thisOnly":
      return b.parent.script.clearExecutorsByEntity(b), this.die();
    case "thisThread":
      return this.die();
    case "otherThread":
      b.parent.script.clearExecutors(), b.parent.script.addExecutor(this.executor);
  }
};
Blockly.Blocks.restart_project = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_restart).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.restart()"]}};
Entry.block.restart_project = function(b, a) {
  Entry.engine.toggleStop();
  Entry.engine.toggleRun();
};
Blockly.Blocks.remove_all_clones = {init:function() {
  this.setColour("#498deb");
  this.appendDummyInput().appendField(Lang.Blocks.FLOW_delete_clone_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/flow_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.remove_all_clones()"]}};
Entry.block.remove_all_clones = function(b, a) {
  var d = b.parent.getClonedEntities();
  d.map(function(a) {
    a.removeClone();
  });
  d = null;
  return a.callReturn();
};
Entry.block.functionAddButton = {skeleton:"basic_button", color:"#eee", isNotFor:["functionInit"], template:"%1", params:[{type:"Text", text:"\ud568\uc218 \ucd94\uac00", color:"#333", align:"center"}], events:{mousedown:[function() {
  Entry.variableContainer.createFunction();
}]}, syntax:{js:[], py:[]}};
Blockly.Blocks.function_field_label = {init:function() {
  this.setColour("#f9c535");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_explanation_1), "NAME");
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_label = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#f9c535", template:"%1%2", params:[{type:"TextInput", value:"\ud568\uc218"}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_string = {init:function() {
  this.setColour("#FFD974");
  this.appendValueInput("PARAM").setCheck(["String"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_string = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#ffd974", template:"%1%2", params:[{type:"Block", accept:"stringMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_field_boolean = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("PARAM").setCheck(["Boolean"]);
  this.appendValueInput("NEXT").setCheck(["Param"]);
  this.setOutput(!0, "Param");
  this.setInputsInline(!0);
}};
Entry.block.function_field_boolean = {skeleton:"basic_param", isNotFor:["functionEdit"], color:"#aeb8ff", template:"%1%2", params:[{type:"Block", accept:"booleanMagnet", restore:!0}, {type:"Output", accept:"paramMagnet"}]};
Blockly.Blocks.function_param_string = {init:function() {
  this.setEditable(!1);
  this.setColour("#FFD974");
  this.setOutput(!0, ["String", "Number"]);
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.stringHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_character_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_string = function(b, a, d) {
  return a.register[a.hashId].run();
};
Entry.block.function_param_string = {skeleton:"basic_string_field", color:"#ffd974", template:"\ubb38\uc790/\uc22b\uc790\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_param_boolean = {init:function() {
  this.setEditable(!1);
  this.setColour("#AEB8FF");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, domToMutation:function(b) {
  b.getElementsByTagName("field");
  this.hashId = b.getAttribute("hashid");
  (b = Entry.Func.targetFunc.booleanHash[this.hashId]) || (b = "");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.FUNCTION_logical_variable + b), "");
}, mutationToDom:function() {
  var b = document.createElement("mutation");
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_param_boolean = function(b, a, d) {
  return a.register[a.hashId].run();
};
Entry.block.function_param_boolean = {skeleton:"basic_boolean_field", color:"#aeb8ff", template:"\ud310\ub2e8\uac12", func:function() {
  return this.executor.register.params[this.executor.register.paramMap[this.block.type]];
}};
Blockly.Blocks.function_create = {init:function() {
  this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_define);
  this.setColour("#cc7337");
  this.appendValueInput("FIELD").setCheck(["Param"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Entry.block.function_create = function(b, a) {
  return a.callReturn();
};
Entry.block.function_create = {skeleton:"basic", color:"#cc7337", event:"funcDef", template:"\ud568\uc218 \uc815\uc758\ud558\uae30 %1 %2", params:[{type:"Block", accept:"paramMagnet", value:{type:"function_field_label"}}, {type:"Indicator", img:"/lib/entryjs/images/block_icon/function_03.png", size:12}], func:function() {
}};
Blockly.Blocks.function_general = {init:function() {
  this.setColour("#cc7337");
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, domToMutation:function(b) {
  var a = b.getElementsByTagName("field");
  this.appendDummyInput().appendField("");
  a.length || this.appendDummyInput().appendField(Lang.Blocks.FUNCTION_function);
  for (var d = 0;d < a.length;d++) {
    var c = a[d], e = c.getAttribute("hashid");
    switch(c.getAttribute("type").toLowerCase()) {
      case "label":
        this.appendDummyInput().appendField(c.getAttribute("content"));
        break;
      case "string":
        this.appendValueInput(e).setCheck(["String", "Number"]);
        break;
      case "boolean":
        this.appendValueInput(e).setCheck(["Boolean"]);
    }
  }
  this.hashId = b.getAttribute("hashid");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/function_03.png", "*"));
}, mutationToDom:function() {
  for (var b = document.createElement("mutation"), a = 1;a < this.inputList.length;a++) {
    var d = this.inputList[a];
    if (d.fieldRow[0] && d.fieldRow[0] instanceof Blockly.FieldLabel) {
      var d = d.fieldRow[0], c = document.createElement("field");
      c.setAttribute("type", "label");
      c.setAttribute("content", d.text_);
    } else {
      d.connection && "String" == d.connection.check_[0] ? (c = document.createElement("field"), c.setAttribute("type", "string"), c.setAttribute("hashid", d.name)) : d.connection && "Boolean" == d.connection.check_[0] && (c = document.createElement("field"), c.setAttribute("type", "boolean"), c.setAttribute("hashid", d.name));
    }
    b.appendChild(c);
  }
  b.setAttribute("hashid", this.hashId);
  return b;
}};
Entry.block.function_general = function(b, a) {
  if (!a.thread) {
    var d = Entry.variableContainer.getFunction(a.hashId);
    a.thread = new Entry.Script(b);
    a.thread.register = a.values;
    for (var c = 0;c < d.content.childNodes.length;c++) {
      "function_create" == d.content.childNodes[c].getAttribute("type") && a.thread.init(d.content.childNodes[c]);
    }
  }
  if (d = Entry.Engine.computeThread(b, a.thread)) {
    return a.thread = d, a;
  }
  delete a.thread;
  return a.callReturn();
};
Entry.block.function_general = {skeleton:"basic", color:"#cc7337", template:"\ud568\uc218", params:[], func:function(b) {
  if (!this.initiated) {
    this.initiated = !0;
    var a = Entry.variableContainer.getFunction(this.block.type.substr(5, 9));
    this.funcCode = a.content;
    this.funcExecutor = this.funcCode.raiseEvent("funcDef", b)[0];
    this.funcExecutor.register.params = this.getParams();
    this.funcExecutor.register.paramMap = a.paramMap;
  }
  this.funcExecutor.execute();
  if (!this.funcExecutor.isEnd()) {
    return this.funcCode.removeExecutor(this.funcExecutor), Entry.STATIC.BREAK;
  }
}};
Entry.Hamster = {PORT_MAP:{leftWheel:0, rightWheel:0, buzzer:0, outputA:0, outputB:0, leftLed:0, rightLed:0, note:0, lineTracerMode:0, lineTracerModeId:0, lineTracerSpeed:5, ioModeA:0, ioModeB:0}, setZero:function() {
  var b = Entry.Hamster.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  b = Entry.Hamster;
  b.lineTracerModeId = 0;
  b.lineTracerStateId = -1;
  b.tempo = 60;
  b.removeAllTimeouts();
}, lineTracerModeId:0, lineTracerStateId:-1, tempo:60, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, setLineTracerMode:function(b, a) {
  this.lineTracerModeId = this.lineTracerModeId + 1 & 255;
  b.lineTracerMode = a;
  b.lineTracerModeId = this.lineTracerModeId;
}, name:"hamster", monitorTemplate:{imgPath:"hw/hamster.png", width:256, height:256, listPorts:{temperature:{name:Lang.Blocks.HAMSTER_sensor_temperature, type:"input", pos:{x:0, y:0}}, accelerationX:{name:Lang.Blocks.HAMSTER_sensor_accelerationX, type:"input", pos:{x:0, y:0}}, accelerationY:{name:Lang.Blocks.HAMSTER_sensor_accelerationY, type:"input", pos:{x:0, y:0}}, accelerationZ:{name:Lang.Blocks.HAMSTER_sensor_accelerationZ, type:"input", pos:{x:0, y:0}}, buzzer:{name:Lang.Hw.buzzer, type:"output", 
pos:{x:0, y:0}}, note:{name:Lang.Hw.buzzer + "2", type:"output", pos:{x:0, y:0}}, outputA:{name:Lang.Hw.output + "A", type:"output", pos:{x:0, y:0}}, outputB:{name:Lang.Hw.output + "B", type:"output", pos:{x:0, y:0}}}, ports:{leftProximity:{name:Lang.Blocks.HAMSTER_sensor_leftProximity, type:"input", pos:{x:122, y:156}}, rightProximity:{name:Lang.Blocks.HAMSTER_sensor_rightProximity, type:"input", pos:{x:10, y:108}}, leftFloor:{name:Lang.Blocks.HAMSTER_sensor_leftFloor, type:"input", pos:{x:100, 
y:234}}, rightFloor:{name:Lang.Blocks.HAMSTER_sensor_rightFloor, type:"input", pos:{x:13, y:180}}, lightsensor:{name:Lang.Hw.light + Lang.Hw.sensor, type:"input", pos:{x:56, y:189}}, leftWheel:{name:Lang.Hw.leftWheel, type:"output", pos:{x:209, y:115}}, rightWheel:{name:Lang.Hw.rightWheel, type:"output", pos:{x:98, y:30}}, leftLed:{name:Lang.Hw.left + " " + Lang.Hw.led, type:"output", pos:{x:87, y:210}}, rightLed:{name:Lang.Hw.right + " " + Lang.Hw.led, type:"output", pos:{x:24, y:168}}}, mode:"both"}};
Blockly.Blocks.hamster_hand_found = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_hand_found);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.hamster_hand_found = function(b, a) {
  var d = Entry.hw.portData;
  return 50 < d.leftProximity || 50 < d.rightProximity;
};
Blockly.Blocks.hamster_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_sensor_leftProximity, "leftProximity"], [Lang.Blocks.HAMSTER_sensor_rightProximity, "rightProximity"], [Lang.Blocks.HAMSTER_sensor_leftFloor, "leftFloor"], [Lang.Blocks.HAMSTER_sensor_rightFloor, "rightFloor"], [Lang.Blocks.HAMSTER_sensor_accelerationX, "accelerationX"], [Lang.Blocks.HAMSTER_sensor_accelerationY, "accelerationY"], [Lang.Blocks.HAMSTER_sensor_accelerationZ, "accelerationZ"], [Lang.Blocks.HAMSTER_sensor_light, 
  "light"], [Lang.Blocks.HAMSTER_sensor_temperature, "temperature"], [Lang.Blocks.HAMSTER_sensor_signalStrength, "signalStrength"], [Lang.Blocks.HAMSTER_sensor_inputA, "inputA"], [Lang.Blocks.HAMSTER_sensor_inputB, "inputB"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.hamster_value = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.hamster_move_forward_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_once).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_once = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      switch(a.boardState) {
        case 1:
          2 > a.count ? (50 > c.leftFloor && 50 > c.rightFloor ? a.count++ : a.count = 0, c = c.leftFloor - c.rightFloor, d.leftWheel = 45 + .25 * c, d.rightWheel = 45 - .25 * c) : (a.count = 0, a.boardState = 2);
          break;
        case 2:
          c = c.leftFloor - c.rightFloor;
          d.leftWheel = 45 + .25 * c;
          d.rightWheel = 45 - .25 * c;
          a.boardState = 3;
          var e = setTimeout(function() {
            a.boardState = 4;
            Entry.Hamster.removeTimeout(e);
          }, 250);
          Entry.Hamster.timeouts.push(e);
          break;
        case 3:
          c = c.leftFloor - c.rightFloor;
          d.leftWheel = 45 + .25 * c;
          d.rightWheel = 45 - .25 * c;
          break;
        case 4:
          d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1;
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  d.leftWheel = 45;
  d.rightWheel = 45;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a;
};
Blockly.Blocks.hamster_turn_once = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_once_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_once_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_once = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData;
  if (a.isStart) {
    if (a.isMoving) {
      if (a.isLeft) {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < c.leftFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > c.leftFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > c.leftFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < c.leftFloor && (a.boardState = 5);
            break;
          case 5:
            c = c.leftFloor - c.rightFloor, -15 < c ? (d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (d.leftWheel = .5 * c, d.rightWheel = .5 * -c);
        }
      } else {
        switch(a.boardState) {
          case 1:
            2 > a.count ? 50 < c.rightFloor && a.count++ : (a.count = 0, a.boardState = 2);
            break;
          case 2:
            20 > c.rightFloor && (a.boardState = 3);
            break;
          case 3:
            2 > a.count ? 20 > c.rightFloor && a.count++ : (a.count = 0, a.boardState = 4);
            break;
          case 4:
            50 < c.rightFloor && (a.boardState = 5);
            break;
          case 5:
            c = c.rightFloor - c.leftFloor, -15 < c ? (d.leftWheel = 0, d.rightWheel = 0, a.boardState = 0, a.isMoving = !1) : (d.leftWheel = .5 * -c, d.rightWheel = .5 * c);
        }
      }
      return a;
    }
    delete a.isStart;
    delete a.isMoving;
    delete a.count;
    delete a.boardState;
    delete a.isLeft;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.isMoving = !0;
  a.count = 0;
  a.boardState = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (a.isLeft = !0, d.leftWheel = -45, d.rightWheel = 45) : (a.isLeft = !1, d.leftWheel = 45, d.rightWheel = -45);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a;
};
Blockly.Blocks.hamster_move_forward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_forward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_forward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = 30;
  d.rightWheel = 30;
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_move_backward_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_move_backward_for_secs_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_move_backward_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.leftWheel = -30;
  d.rightWheel = -30;
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_turn_for_secs = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_turn_for_secs_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_turn_for_secs_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_turn_for_secs = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.leftWheel = 0;
    d.rightWheel = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  "LEFT" == a.getField("DIRECTION", a) ? (d.leftWheel = -30, d.rightWheel = 30) : (d.leftWheel = 30, d.rightWheel = -30);
  Entry.Hamster.setLineTracerMode(d, 0);
  var d = 1E3 * a.getNumberValue("VALUE"), c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, d);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_change_both_wheels_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_both_wheels_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_both_wheels_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("LEFT"), e = a.getNumberValue("RIGHT");
  d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + c : c;
  d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_both_wheels_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_1);
  this.appendValueInput("LEFT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_2);
  this.appendValueInput("RIGHT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_both_wheels_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_both_wheels_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = a.getNumberValue("LEFT");
  d.rightWheel = a.getNumberValue("RIGHT");
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_wheel_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_change_wheel_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_wheel_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_wheel_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e : ("RIGHT" != c && (d.leftWheel = void 0 != d.leftWheel ? d.leftWheel + e : e), d.rightWheel = void 0 != d.rightWheel ? d.rightWheel + e : e);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_wheel_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_wheel_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_wheel_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_wheel_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION"), e = a.getNumberValue("VALUE");
  "LEFT" == c ? d.leftWheel = e : ("RIGHT" != c && (d.leftWheel = e), d.rightWheel = e);
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_using = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_using_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_using_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_using_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_using = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("COLOR"), e = a.getField("DIRECTION"), f = 1;
  "RIGHT" == e ? f = 2 : "BOTH" == e && (f = 3);
  "WHITE" == c && (f += 7);
  d.leftWheel = 0;
  d.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(d, f);
  return a.callReturn();
};
Blockly.Blocks.hamster_follow_line_until = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_follow_line_until_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_color_black, "BLACK"], [Lang.General.white, "WHITE"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_follow_line_until_2).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.Blocks.HAMSTER_front, "FRONT"], [Lang.Blocks.HAMSTER_rear, "REAR"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_follow_line_until_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_follow_line_until = function(b, a) {
  var d = Entry.hw.sendQueue, c = Entry.hw.portData, e = a.getField("COLOR"), f = a.getField("DIRECTION"), g = 4;
  "RIGHT" == f ? g = 5 : "FRONT" == f ? g = 6 : "REAR" == f && (g = 7);
  "WHITE" == e && (g += 7);
  if (a.isStart) {
    if (e = Entry.Hamster, c.lineTracerStateId != e.lineTracerStateId && (e.lineTracerStateId = c.lineTracerStateId, 64 == c.lineTracerState)) {
      return delete a.isStart, Entry.engine.isContinue = !1, e.setLineTracerMode(d, 0), a.callReturn();
    }
  } else {
    a.isStart = !0, d.leftWheel = 0, d.rightWheel = 0, Entry.Hamster.setLineTracerMode(d, g);
  }
  return a;
};
Blockly.Blocks.hamster_set_following_speed_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_following_speed_to_1).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "SPEED").appendField(Lang.Blocks.HAMSTER_set_following_speed_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_following_speed_to = function(b, a) {
  Entry.hw.sendQueue.lineTracerSpeed = Number(a.getField("SPEED", a));
  return a.callReturn();
};
Blockly.Blocks.hamster_stop = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_stop).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_stop = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.leftWheel = 0;
  d.rightWheel = 0;
  Entry.Hamster.setLineTracerMode(d, 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_led_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_led_to_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_set_led_to_2).appendField(new Blockly.FieldDropdown([[Lang.General.red, "4"], [Lang.General.yellow, "6"], [Lang.General.green, "2"], [Lang.Blocks.HAMSTER_color_cyan, "3"], [Lang.General.blue, "1"], [Lang.Blocks.HAMSTER_color_magenta, "5"], [Lang.General.white, 
  "7"]]), "COLOR").appendField(Lang.Blocks.HAMSTER_set_led_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_led_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a), e = Number(a.getField("COLOR", a));
  "LEFT" == c ? d.leftLed = e : ("RIGHT" != c && (d.leftLed = e), d.rightLed = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_led_1).appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"], [Lang.General.both, "BOTH"]]), "DIRECTION").appendField(Lang.Blocks.HAMSTER_clear_led_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_led = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("DIRECTION", a);
  "LEFT" == c ? d.leftLed = 0 : ("RIGHT" != c && (d.leftLed = 0), d.rightLed = 0);
  return a.callReturn();
};
Blockly.Blocks.hamster_beep = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_beep).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_beep = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.buzzer = 0;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 440;
  d.note = 0;
  var c = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(c);
  }, 200);
  Entry.Hamster.timeouts.push(c);
  return a;
};
Blockly.Blocks.hamster_change_buzzer_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_buzzer_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_buzzer_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberValue("VALUE");
  d.buzzer = void 0 != d.buzzer ? d.buzzer + c : c;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_set_buzzer_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_buzzer_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_buzzer_to = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = a.getNumberValue("VALUE");
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_clear_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_clear_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_clear_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.buzzer = 0;
  d.note = 0;
  return a.callReturn();
};
Blockly.Blocks.hamster_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.General.note_c + "", "4"], [Lang.General.note_c + "#", "5"], [Lang.General.note_d + "", "6"], [Lang.General.note_e + "b", "7"], [Lang.General.note_e + "", "8"], [Lang.General.note_f + "", "9"], [Lang.General.note_f + "#", "10"], [Lang.General.note_g + "", "11"], [Lang.General.note_g + "#", "12"], [Lang.General.note_a + "", "13"], [Lang.General.note_b + "b", "14"], [Lang.General.note_b + 
  "", "15"]]), "NOTE").appendField(Lang.Blocks.HAMSTER_play_note_for_2).appendField(new Blockly.FieldDropdown([["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    d.note = 0;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberValue("VALUE", a), g = Entry.Hamster.tempo, f = 6E4 * f / g;
  a.isStart = !0;
  a.timeFlag = 1;
  d.buzzer = 0;
  d.note = c + 12 * (e - 1);
  if (100 < f) {
    var h = setTimeout(function() {
      d.note = 0;
      Entry.Hamster.removeTimeout(h);
    }, f - 100);
    Entry.Hamster.timeouts.push(h);
  }
  var k = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(k);
  }, f);
  Entry.Hamster.timeouts.push(k);
  return a;
};
Blockly.Blocks.hamster_rest_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_rest_for_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_rest_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.isStart;
    delete a.timeFlag;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  a.isStart = !0;
  a.timeFlag = 1;
  var c = a.getNumberValue("VALUE"), c = 6E4 * c / Entry.Hamster.tempo;
  d.buzzer = 0;
  d.note = 0;
  var e = setTimeout(function() {
    a.timeFlag = 0;
    Entry.Hamster.removeTimeout(e);
  }, c);
  Entry.Hamster.timeouts.push(e);
  return a;
};
Blockly.Blocks.hamster_change_tempo_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_tempo_by_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_tempo_by = function(b, a) {
  Entry.Hamster.tempo += a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_tempo_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_tempo_to_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_tempo_to = function(b, a) {
  Entry.Hamster.tempo = a.getNumberValue("VALUE");
  1 > Entry.Hamster.tempo && (Entry.Hamster.tempo = 1);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_port_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_port_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_port_to_2).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_analog_input, "0"], [Lang.Blocks.HAMSTER_digital_input, "1"], [Lang.Blocks.HAMSTER_servo_output, "8"], [Lang.Blocks.HAMSTER_pwm_output, "9"], [Lang.Blocks.HAMSTER_digital_output, 
  "10"]]), "MODE").appendField(Lang.Blocks.HAMSTER_set_port_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_port_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT", a), e = Number(a.getField("MODE", a));
  "A" == c ? d.ioModeA = e : ("B" != c && (d.ioModeA = e), d.ioModeB = e);
  return a.callReturn();
};
Blockly.Blocks.hamster_change_output_by = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_change_output_by_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_change_output_by_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_change_output_by = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == c ? d.outputA = void 0 != d.outputA ? d.outputA + e : e : ("B" != c && (d.outputA = void 0 != d.outputA ? d.outputA + e : e), d.outputB = void 0 != d.outputB ? d.outputB + e : e);
  return a.callReturn();
};
Blockly.Blocks.hamster_set_output_to = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.HAMSTER_port_a, "A"], [Lang.Blocks.HAMSTER_port_b, "B"], [Lang.Blocks.HAMSTER_port_ab, "AB"]]), "PORT").appendField(Lang.Blocks.HAMSTER_set_output_to_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_set_output_to_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hamster_set_output_to = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getField("PORT"), e = a.getNumberValue("VALUE");
  "A" == c ? d.outputA = e : ("B" != c && (d.outputA = e), d.outputB = e);
  return a.callReturn();
};
Blockly.Blocks.is_clicked = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_clicked, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_mouse_clicked()"]}};
Entry.block.is_clicked = function(b, a) {
  return Entry.stage.isClick;
};
Blockly.Blocks.is_press_some_key = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.JUDGEMENT_is_press_some_key_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_particular_key_pressed(%1)"]}};
Entry.block.is_press_some_key = function(b, a) {
  var d = Number(a.getField("VALUE", a));
  return 0 <= Entry.pressedKeys.indexOf(d);
};
Blockly.Blocks.reach_something = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_1, "#3D3D3D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("collision"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_reach_something_2, "#3D3D3D");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["Entry.is_reached_at(%2)"]}};
Entry.block.reach_something = function(b, a) {
  if (!b.getVisible()) {
    return !1;
  }
  var d = a.getField("VALUE", a), c = b.object, e = /wall/.test(d), f = ndgmr.checkPixelCollision;
  if (e) {
    switch(e = Entry.stage.wall, d) {
      case "wall":
        if (f(c, e.up, .2, !0) || f(c, e.down, .2, !0) || f(c, e.left, .2, !0) || f(c, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_up":
        if (f(c, e.up, .2, !0)) {
          return !0;
        }
        break;
      case "wall_down":
        if (f(c, e.down, .2, !0)) {
          return !0;
        }
        break;
      case "wall_right":
        if (f(c, e.right, .2, !0)) {
          return !0;
        }
        break;
      case "wall_left":
        if (f(c, e.left, .2, !0)) {
          return !0;
        }
      ;
    }
  } else {
    if ("mouse" == d) {
      return f = Entry.stage.canvas, f = c.globalToLocal(f.mouseX, f.mouseY), c.hitTest(f.x, f.y);
    }
    d = Entry.container.getEntity(d);
    if ("textBox" == d.type || "textBox" == b.type) {
      f = d.object.getTransformedBounds();
      c = c.getTransformedBounds();
      if (Entry.checkCollisionRect(c, f)) {
        return !0;
      }
      for (var d = d.parent.clonedEntities, e = 0, g = d.length;e < g;e++) {
        var h = d[e];
        if (!h.isStamp && h.getVisible() && Entry.checkCollisionRect(c, h.object.getTransformedBounds())) {
          return !0;
        }
      }
    } else {
      if (d.getVisible() && f(c, d.object, .2, !0)) {
        return !0;
      }
      d = d.parent.clonedEntities;
      e = 0;
      for (g = d.length;e < g;e++) {
        if (h = d[e], !h.isStamp && h.getVisible() && f(c, h.object, .2, !0)) {
          return !0;
        }
      }
    }
  }
  return !1;
};
Blockly.Blocks.boolean_comparison = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["=", "EQUAL"], ["<", "SMALLER"], [">", "BIGGER"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_comparison = function(b, a) {
  var d = a.getField("OPERATOR", a), c = a.getNumberValue("LEFTHAND", a), e = a.getNumberValue("RIGHTHAND", a);
  return "EQUAL" == d ? c == e : "BIGGER" == d ? c > e : c < e;
};
Blockly.Blocks.boolean_equal = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField("=", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["String", "Number"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_equal = function(b, a) {
  var d = a.getStringValue("LEFTHAND", a), c = a.getStringValue("RIGHTHAND", a);
  return d == c;
};
Blockly.Blocks.boolean_bigger = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(">", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_bigger = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d > c;
};
Blockly.Blocks.boolean_smaller = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField("<", "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.boolean_smaller = function(b, a) {
  var d = a.getNumberValue("LEFTHAND", a), c = a.getNumberValue("RIGHTHAND", a);
  return d < c;
};
Blockly.Blocks.boolean_and_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_boolean_and, "AND"], [Lang.Blocks.JUDGEMENT_boolean_or, "OR"]]), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 or %2"]}};
Entry.block.boolean_and_or = function(b, a) {
  var d = a.getField("OPERATOR", a), c = a.getBooleanValue("LEFTHAND", a), e = a.getBooleanValue("RIGHTHAND", a);
  return "AND" == d ? c && e : c || e;
};
Blockly.Blocks.boolean_and = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_and, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 && %3"]}};
Entry.block.boolean_and = function(b, a) {
  var d = a.getBooleanValue("LEFTHAND", a), c = a.getBooleanValue("RIGHTHAND", a);
  return d && c;
};
Blockly.Blocks.boolean_or = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_or, "#3D3D3D");
  this.appendValueInput("RIGHTHAND").setCheck("Boolean");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["%1 || %3"]}};
Entry.block.boolean_or = function(b, a) {
  var d = a.getBooleanValue("LEFTHAND", a), c = a.getBooleanValue("RIGHTHAND", a);
  return d || c;
};
Blockly.Blocks.boolean_not = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_1, "#3D3D3D");
  this.appendValueInput("VALUE").setCheck("Boolean");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_boolean_not_2, "#3D3D3D");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["!%2"]}};
Entry.block.boolean_not = function(b, a) {
  return !a.getBooleanValue("VALUE");
};
Blockly.Blocks.true_or_false = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.JUDGEMENT_true, "true"], [Lang.Blocks.JUDGEMENT_false, "false"]]), "VALUE");
  this.appendDummyInput();
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.true_or_false = function(b, a) {
  return "true" == a.children[0].textContent;
};
Blockly.Blocks.True = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_true, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["True"]}};
Entry.block.True = function(b, a) {
  return !0;
};
Blockly.Blocks.False = {init:function() {
  this.setColour("#AEB8FF");
  this.appendDummyInput().appendField(Lang.Blocks.JUDGEMENT_false, "#3D3D3D").appendField(" ");
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{py:["false"]}};
Entry.block.False = function(b, a) {
  return !1;
};
Blockly.Blocks.boolean_basic_operator = {init:function() {
  this.setColour("#AEB8FF");
  this.appendValueInput("LEFTHAND").setCheck(["String", "Number"]);
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([["=", "EQUAL"], [">", "GREATER"], ["<", "LESS"], ["\u2265", "GREATER_OR_EQUAL"], ["\u2264", "LESS_OR_EQUAL"]], null, !1), "OPERATOR");
  this.appendValueInput("RIGHTHAND").setCheck(["Number", "String"]);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1 %2 %3"]}};
Entry.block.boolean_basic_operator = function(b, a) {
  var d = a.getField("OPERATOR", a), c = a.getStringValue("LEFTHAND", a), e = a.getStringValue("RIGHTHAND", a);
  switch(d) {
    case "EQUAL":
      return c == e;
    case "GREATER":
      return Number(c) > Number(e);
    case "LESS":
      return Number(c) < Number(e);
    case "GREATER_OR_EQUAL":
      return Number(c) >= Number(e);
    case "LESS_OR_EQUAL":
      return Number(c) <= Number(e);
  }
};
Blockly.Blocks.show = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_show).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.show()"]}};
Entry.block.show = function(b, a) {
  b.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_hide).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.hide()"]}};
Entry.block.hide = function(b, a) {
  b.setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.dialog_time = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.dialog_for_seconds(%1, %2, %3)"]}};
Entry.block.dialog_time = function(b, a) {
  if (!a.isStart) {
    var d = a.getNumberValue("SECOND", a), c = a.getStringValue("VALUE", a), e = a.getField("OPTION", a);
    a.isStart = !0;
    a.timeFlag = 1;
    c || "number" == typeof c || (c = "    ");
    c = Entry.convertToRoundedDecimals(c, 3);
    new Entry.Dialog(b, c, e);
    b.syncDialogVisible(b.getVisible());
    setTimeout(function() {
      a.timeFlag = 0;
    }, 1E3 * d);
  }
  return 0 == a.timeFlag ? (delete a.timeFlag, delete a.isStart, b.dialog && b.dialog.remove(), a.callReturn()) : a;
};
Blockly.Blocks.dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.speak, "speak"]]), "OPTION");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.dialog(%1, %2)"]}};
Entry.block.dialog = function(b, a) {
  var d = a.getStringValue("VALUE", a);
  d || "number" == typeof d || (d = "    ");
  var c = a.getField("OPTION", a), d = Entry.convertToRoundedDecimals(d, 3);
  new Entry.Dialog(b, d, c);
  b.syncDialogVisible(b.getVisible());
  return a.callReturn();
};
Blockly.Blocks.remove_dialog = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_remove_dialog).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.remove_dialog()"]}};
Entry.block.remove_dialog = function(b, a) {
  b.dialog && b.dialog.remove();
  return a.callReturn();
};
Blockly.Blocks.change_to_nth_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_to_nth_shape = function(b, a) {
  var d = a.getField("VALUE", a), d = b.parent.getPicture(d);
  b.setImage(d);
  return a.callReturn();
};
Blockly.Blocks.change_to_next_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_near_shape_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_shape_next, "next"], [Lang.Blocks.LOOKS_change_shape_prev, "prev"]]), "DRIECTION").appendField(Lang.Blocks.LOOKS_change_to_near_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_to_adjacent_shape(%1)"]}};
Entry.block.change_to_next_shape = function(b, a) {
  var d;
  d = a.fields && "prev" === a.getStringField("DRIECTION") ? b.parent.getPrevPicture(b.picture.id) : b.parent.getNextPicture(b.picture.id);
  b.setImage(d);
  return a.callReturn();
};
Blockly.Blocks.set_effect_volume = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.add_effect(%1, %2)"]}};
Entry.block.set_effect_volume = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hue = c + b.effect.hue : "lens" != d && "swriling" != d && "pixel" != d && "mosaic" != d && ("brightness" == d ? b.effect.brightness = c + b.effect.brightness : "blur" != d && "opacity" == d && (b.effect.alpha += c / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.opacity, "opacity"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_effect(%1, %2)"]}};
Entry.block.set_effect = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hue = c : "lens" != d && "swriling" != d && "pixel" != d && "mosaic" != d && ("brightness" == d ? b.effect.brightness = c : "blur" != d && "opacity" == d && (b.effect.alpha = c / 100));
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.erase_all_effects = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_erase_all_effects).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.remove_all_effects()"]}};
Entry.block.erase_all_effects = function(b, a) {
  b.resetFilter();
  return a.callReturn();
};
Blockly.Blocks.change_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_scale_percent = function(b, a) {
  var d = (a.getNumberValue("VALUE", a) + 100) / 100;
  b.setScaleX(b.getScaleX() * d);
  b.setScaleY(b.getScaleY() * d);
  return a.callReturn();
};
Blockly.Blocks.set_scale_percent = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_scale_percent = function(b, a) {
  var d = a.getNumberValue("VALUE", a) / 100, c = b.snapshot_;
  b.setScaleX(d * c.scaleX);
  b.setScaleY(d * c.scaleY);
  return a.callReturn();
};
Blockly.Blocks.change_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_size(%1)"]}};
Entry.block.change_scale_size = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setSize(b.getSize() + d);
  return a.callReturn();
};
Blockly.Blocks.set_scale_size = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_scale_percent_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_size(%1)"]}};
Entry.block.set_scale_size = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setSize(d);
  return a.callReturn();
};
Blockly.Blocks.flip_y = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.flip_horizontal()"]}};
Entry.block.flip_y = function(b, a) {
  b.setScaleX(-1 * b.getScaleX());
  return a.callReturn();
};
Blockly.Blocks.flip_x = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_flip_x).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.flip_vertical()"]}};
Entry.block.flip_x = function(b, a) {
  b.setScaleY(-1 * b.getScaleY());
  return a.callReturn();
};
Blockly.Blocks.set_object_order = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("objectSequence"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_object_order_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_object_order = function(b, a) {
  var d = a.getField("VALUE", a), c = Entry.container.getCurrentObjects().indexOf(b.parent);
  if (-1 < c) {
    return Entry.container.moveElementByBlock(c, d), a.callReturn();
  }
  throw Error("object is not available");
};
Blockly.Blocks.get_pictures = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("pictures"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:[]}};
Entry.block.get_pictures = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.change_to_some_shape = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_to_nth_shape_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_to_some_shape(%1)"]}};
Entry.block.change_to_some_shape = function(b, a) {
  var d = a.getStringValue("VALUE");
  Entry.parseNumber(d);
  d = b.parent.getPicture(d);
  b.setImage(d);
  return a.callReturn();
};
Blockly.Blocks.add_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.add_effect_by_cbt(%1, %2)"]}};
Entry.block.add_effect_amount = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hsv = c + b.effect.hsv : "brightness" == d ? b.effect.brightness = c + b.effect.brightness : "transparency" == d && (b.effect.alpha -= c / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_effect_by_cbt(%1, %2)"]}};
Entry.block.change_effect_amount = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hsv = c : "brightness" == d ? b.effect.brightness = c : "transparency" == d && (b.effect.alpha = 1 - c / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_effect_amount = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_volume_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_effect_amount = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hue = c + b.effect.hue : "brightness" == d ? b.effect.brightness = c + b.effect.brightness : "transparency" == d && (b.effect.alpha -= c / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.set_entity_effect = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.color, "color"], [Lang.Blocks.brightness, "brightness"], [Lang.Blocks.transparency, "transparency"]]), "EFFECT");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_set_effect_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.set_entity_effect = function(b, a) {
  var d = a.getField("EFFECT", a), c = a.getNumberValue("VALUE", a);
  "color" == d ? b.effect.hue = c : "brightness" == d ? b.effect.brightness = c : "transparency" == d && (b.effect.alpha = 1 - c / 100);
  b.applyFilter();
  return a.callReturn();
};
Blockly.Blocks.change_object_index = {init:function() {
  this.setColour("#EC4466");
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_change_object_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.LOOKS_change_object_index_sub_1, "FRONT"], [Lang.Blocks.LOOKS_change_object_index_sub_2, "FORWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_3, "BACKWARD"], [Lang.Blocks.LOOKS_change_object_index_sub_4, "BACK"]]), "LOCATION").appendField(Lang.Blocks.LOOKS_change_object_index_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/looks_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.locate_to(%1)"]}};
Entry.block.change_object_index = function(b, a) {
  var d, c = a.getField("LOCATION", a), e = Entry.container.getCurrentObjects(), f = e.indexOf(b.parent), e = e.length - 1;
  if (0 > f) {
    throw Error("object is not available for current scene");
  }
  switch(c) {
    case "FRONT":
      d = 0;
      break;
    case "FORWARD":
      d = Math.max(0, f - 1);
      break;
    case "BACKWARD":
      d = Math.min(e, f + 1);
      break;
    case "BACK":
      d = e;
  }
  Entry.container.moveElementByBlock(f, d);
  return a.callReturn();
};
Blockly.Blocks.move_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_moving_direction(%1)"]}};
Entry.block.move_direction = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + d * Math.cos((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.setY(b.getY() - d * Math.sin((b.getRotation() + b.getDirection() - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.change_x(%1)"]}};
Entry.block.move_x = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setX(b.getX() + d);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.move_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_y(%1)"]}};
Entry.block.move_y = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setY(b.getY() + d);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy_for_seconds(%1, %2, %3)"]}};
Entry.block.locate_xy_time = function(b, a) {
  if (!a.isStart) {
    var d;
    d = a.getNumberValue("VALUE1", a);
    a.isStart = !0;
    a.frameCount = Math.floor(d * Entry.FPS);
    a.x = a.getNumberValue("VALUE2", a);
    a.y = a.getNumberValue("VALUE3", a);
  }
  if (0 != a.frameCount) {
    d = a.x - b.getX();
    var c = a.y - b.getY();
    d /= a.frameCount;
    c /= a.frameCount;
    b.setX(b.getX() + d);
    b.setY(b.getY() + c);
    a.frameCount--;
    b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
    return a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setRotation(b.getRotation() + d);
  return a.callReturn();
};
Blockly.Blocks.rotate_by_angle_dropdown = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["45", "45"], ["90", "90"], ["135", "135"], ["180", "180"]]), "VALUE").appendField(Lang.Blocks.MOVING_rotate_by_angle_dropdown_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_dropdown = function(b, a) {
  var d = a.getField("VALUE", a);
  b.setRotation(b.getRotation() + Number(d));
  return a.callReturn();
};
Blockly.Blocks.see_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setDirection(d);
  return a.callReturn();
};
Blockly.Blocks.see_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_direction = function(b, a) {
  var d = a.getField("VALUE", a), c = Entry.container.getEntity(d), d = c.getX() - b.getX(), c = c.getY() - b.getY();
  0 <= d ? b.setRotation(Math.atan(c / d) / Math.PI * 180 + 90) : b.setRotation(Math.atan(c / d) / Math.PI * 180 + 270);
  return a.callReturn();
};
Blockly.Blocks.locate_xy = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_xy_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy(%1, %2)"]}};
Entry.block.locate_xy = function(b, a) {
  var d = a.getNumberValue("VALUE1", a);
  b.setX(d);
  d = a.getNumberValue("VALUE2", a);
  b.setY(d);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_x = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_x_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_x(%1)"]}};
Entry.block.locate_x = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setX(d);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate_y = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_y_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_y(%1)"]}};
Entry.block.locate_y = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setY(d);
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.locate = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_object(%1)"]}};
Entry.block.locate = function(b, a) {
  var d = a.getField("VALUE", a), c;
  "mouse" == d ? (d = Entry.stage.mouseCoordinate.x, c = Entry.stage.mouseCoordinate.y) : (c = Entry.container.getEntity(d), d = c.getX(), c = c.getY());
  b.setX(Number(d));
  b.setY(Number(c));
  b.brush && !b.brush.stop && b.brush.lineTo(d, -1 * c);
  return a.callReturn();
};
Blockly.Blocks.move_xy_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_1);
  this.appendValueInput("VALUE1").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_2);
  this.appendValueInput("VALUE2").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_3);
  this.appendValueInput("VALUE3").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_xy_time_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_xy_for_seconds(%1, %2, %3)"]}};
Entry.block.move_xy_time = function(b, a) {
  if (!a.isStart) {
    var d;
    d = a.getNumberValue("VALUE1", a);
    var c = a.getNumberValue("VALUE2", a), e = a.getNumberValue("VALUE3", a);
    a.isStart = !0;
    a.frameCount = Math.floor(d * Entry.FPS);
    a.dX = c / a.frameCount;
    a.dY = e / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.locate_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sprites"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.rotate_by_angle_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldAngle("90"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_by_angle_time = function(b, a) {
  if (!a.isStart) {
    var d;
    d = a.getNumberValue("VALUE", a);
    var c = a.getNumberField("VALUE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(d * Entry.FPS);
    a.dAngle = c / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.bounce_when = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("bounce"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_when_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setPreviousStatement(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}};
Blockly.Blocks.bounce_wall = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_bounce_wall).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.on_bounce_at_wall()"]}};
Entry.block.bounce_wall = function(b, a) {
  var d = b.parent.getRotateMethod(), c = "free" == d ? (b.getRotation() + b.getDirection()).mod(360) : b.getDirection(), e = Entry.Utils.COLLISION.NONE;
  if (90 > c && 0 <= c || 360 > c && 270 <= c) {
    var e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1);
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE);
    f && e && (f = !1);
    f ? ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP) : (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = 
    Entry.Utils.COLLISION.DOWN));
  } else {
    270 > c && 90 <= c && (e = b.collision == Entry.Utils.COLLISION.DOWN, f = ndgmr.checkPixelCollision(Entry.stage.wall.down, b.object, 0, !1), !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f ? ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.DOWN) : (e = b.collision == Entry.Utils.COLLISION.UP, f = ndgmr.checkPixelCollision(Entry.stage.wall.up, b.object, 0, !1), 
    !f && e && (b.collision = Entry.Utils.COLLISION.NONE), f && e && (f = !1), f && ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection() + 180) : b.setDirection(-b.getDirection() + 180), b.collision = Entry.Utils.COLLISION.UP)));
  }
  360 > c && 180 <= c ? (e = b.collision == Entry.Utils.COLLISION.LEFT, c = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !c && e && (b.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c ? ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT) : (e = b.collision == Entry.Utils.COLLISION.RIGHT, c = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !c && 
  e && (b.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c && ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT))) : 180 > c && 0 <= c && (e = b.collision == Entry.Utils.COLLISION.RIGHT, c = ndgmr.checkPixelCollision(Entry.stage.wall.right, b.object, 0, !1), !c && e && (b.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c ? ("free" == d ? b.setRotation(-b.getRotation() - 
  2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.RIGHT) : (e = b.collision == Entry.Utils.COLLISION.LEFT, c = ndgmr.checkPixelCollision(Entry.stage.wall.left, b.object, 0, !1), !c && e && (b.collision = Entry.Utils.COLLISION.NONE), c && e && (c = !1), c && ("free" == d ? b.setRotation(-b.getRotation() - 2 * b.getDirection()) : b.setDirection(-b.getDirection() + 360), b.collision = Entry.Utils.COLLISION.LEFT)));
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_horizontal = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_horizontal).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_horizontal = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.flip_arrow_vertical = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_flip_arrow_vertical).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.flip_arrow_vertical = function(b, a) {
  b.setDirection(b.getDirection() + 180);
  return a.callReturn();
};
Blockly.Blocks.see_angle_object = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_object_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.look_at_object(%1)"]}};
Entry.block.see_angle_object = function(b, a) {
  var d = a.getField("VALUE", a), c = b.getX(), e = b.getY();
  if (b.parent.id == d) {
    return a.callReturn();
  }
  "mouse" == d ? (d = Entry.stage.mouseCoordinate.y, c = Entry.stage.mouseCoordinate.x - c, e = d - e) : (d = Entry.container.getEntity(d), c = d.getX() - c, e = d.getY() - e);
  e = 0 === c && 0 === e ? b.getDirection() + b.getRotation() : 0 <= c ? -Math.atan(e / c) / Math.PI * 180 + 90 : -Math.atan(e / c) / Math.PI * 180 + 270;
  c = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + e - c);
  return a.callReturn();
};
Blockly.Blocks.see_angle_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.see_angle_direction = function(b, a) {
  var d = a.getNumberValue("VALUE", a), c = b.getDirection() + b.getRotation();
  b.setRotation(b.getRotation() + d - c);
  return a.callReturn();
};
Blockly.Blocks.rotate_direction = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.rotate_direction = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setDirection(d + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.locate_object_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("spritesWithMouse"), "TARGET");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_locate_object_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_at_object_for_seconds(%1, %2)"]}};
Entry.block.locate_object_time = function(b, a) {
  if (!a.isStart) {
    var d, c, e;
    c = a.getField("TARGET", a);
    d = a.getNumberValue("VALUE", a);
    d = Math.floor(d * Entry.FPS);
    e = Entry.stage.mouseCoordinate;
    if (0 != d) {
      "mouse" == c ? (c = e.x - b.getX(), e = e.y - b.getY()) : (e = Entry.container.getEntity(c), c = e.getX() - b.getX(), e = e.getY() - b.getY()), a.isStart = !0, a.frameCount = d, a.dX = c / a.frameCount, a.dY = e / a.frameCount;
    } else {
      return "mouse" == c ? (c = Number(e.x), e = Number(e.y)) : (e = Entry.container.getEntity(c), c = e.getX(), e = e.getY()), b.setX(c), b.setY(e), b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a.callReturn();
    }
  }
  if (0 != a.frameCount) {
    return b.setX(b.getX() + a.dX), b.setY(b.getY() + a.dY), a.frameCount--, b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY()), a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.rotate_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_set_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_direction(%1)"]}};
Entry.block.rotate_absolute = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setRotation(d);
  return a.callReturn();
};
Blockly.Blocks.rotate_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_direction(%1)"]}};
Entry.block.rotate_relative = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setRotation(d + b.getRotation());
  return a.callReturn();
};
Blockly.Blocks.direction_absolute = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_see_angle_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.set_moving_direction(%1)"]}};
Entry.block.direction_absolute = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setDirection(d);
  return a.callReturn();
};
Blockly.Blocks.direction_relative = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_rotate_direction_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_moving_direction(%1)"]}};
Entry.block.direction_relative = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  b.setDirection(d + b.getDirection());
  return a.callReturn();
};
Blockly.Blocks.move_to_angle = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_move_direction_angle_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.move_to_direction_by_distance(%1, %2)"]}};
Entry.block.move_to_angle = function(b, a) {
  var d = a.getNumberValue("VALUE", a), c = a.getNumberValue("ANGLE", a);
  b.setX(b.getX() + d * Math.cos((c - 90) / 180 * Math.PI));
  b.setY(b.getY() - d * Math.sin((c - 90) / 180 * Math.PI));
  b.brush && !b.brush.stop && b.brush.lineTo(b.getX(), -1 * b.getY());
  return a.callReturn();
};
Blockly.Blocks.rotate_by_time = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_explain_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_2);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_1);
  this.appendValueInput("ANGLE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_add_direction_by_angle_time_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_direction_for_seconds(%1, %2)"]}};
Entry.block.rotate_by_time = function(b, a) {
  if (!a.isStart) {
    var d;
    d = a.getNumberValue("VALUE", a);
    var c = a.getNumberValue("ANGLE", a);
    a.isStart = !0;
    a.frameCount = Math.floor(d * Entry.FPS);
    a.dAngle = c / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setRotation(b.getRotation() + a.dAngle), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  return a.callReturn();
};
Blockly.Blocks.direction_relative_duration = {init:function() {
  this.setColour("#A751E3");
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_1);
  this.appendValueInput("DURATION").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_2);
  this.appendValueInput("AMOUNT").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.MOVING_direction_relative_duration_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/moving_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["self.rotate_moving_direction_for_seconds(%1, %2)"]}};
Entry.block.direction_relative_duration = function(b, a) {
  if (!a.isStart) {
    var d;
    d = a.getNumberValue("DURATION", a);
    var c = a.getNumberValue("AMOUNT", a);
    a.isStart = !0;
    a.frameCount = Math.floor(d * Entry.FPS);
    a.dDirection = c / a.frameCount;
  }
  if (0 != a.frameCount) {
    return b.setDirection(b.getDirection() + a.dDirection), a.frameCount--, a;
  }
  delete a.isStart;
  delete a.frameCount;
  delete a.dDirection;
  return a.callReturn();
};
Entry.Neobot = {name:"neobot", LOCAL_MAP:["IN1", "IN2", "IN3", "IR", "BAT"], REMOTE_MAP:"OUT1 OUT2 OUT3 DCR DCL SND FND OPT".split(" "), setZero:function() {
  for (var b in Entry.Neobot.REMOTE_MAP) {
    Entry.hw.sendQueue[Entry.Neobot.REMOTE_MAP[b]] = 0;
  }
  Entry.hw.update();
}, name:"neobot", monitorTemplate:{imgPath:"hw/neobot.png", width:700, height:700, listPorts:{IR:{name:"\ub9ac\ubaa8\ucee8", type:"input", pos:{x:0, y:0}}, BAT:{name:"\ubca0\ud130\ub9ac", type:"input", pos:{x:0, y:0}}, SND:{name:Lang.Hw.buzzer, type:"output", pos:{x:0, y:0}}, FND:{name:"FND", type:"output", pos:{x:0, y:0}}}, ports:{IN1:{name:"IN1", type:"input", pos:{x:270, y:200}}, IN2:{name:"IN2", type:"input", pos:{x:325, y:200}}, IN3:{name:"IN3", type:"input", pos:{x:325, y:500}}, DCL:{name:"L-Motor", 
type:"output", pos:{x:270, y:500}}, DCR:{name:"R-Motor", type:"output", pos:{x:435, y:500}}, OUT1:{name:"OUT1", type:"output", pos:{x:380, y:200}}, OUT2:{name:"OUT2", type:"output", pos:{x:435, y:200}}, OUT3:{name:"OUT3", type:"output", pos:{x:380, y:500}}}, mode:"both"}};
Blockly.Blocks.neobot_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([["1\ubc88 \ud3ec\ud2b8", "IN1"], ["2\ubc88 \ud3ec\ud2b8", "IN2"], ["3\ubc88 \ud3ec\ud2b8", "IN3"], ["\ub9ac\ubaa8\ucee8", "IR"], ["\ubc30\ud130\ub9ac", "BAT"]]), "PORT").appendField(" \uac12");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.neobot_sensor_value = function(b, a) {
  var d = a.getStringField("PORT");
  return Entry.hw.portData[d];
};
Blockly.Blocks.neobot_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_left_motor = function(b, a) {
  var d = a.getNumberField("SPEED"), c = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCL = d + c;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_left_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc67c\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_left_motor = function(b, a) {
  Entry.hw.sendQueue.DCL = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["\uc55e\uc73c\ub85c", "16"], ["\ub4a4\ub85c", "32"]]), "DIRECTION").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField("\uc758 \uc18d\ub3c4\ub85c \ud68c\uc804").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + 
  "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_right_motor = function(b, a) {
  var d = a.getNumberField("SPEED"), c = a.getNumberField("DIRECTION");
  Entry.hw.sendQueue.DCR = d + c;
  return a.callReturn();
};
Blockly.Blocks.neobot_stop_right_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc624\ub978\ucabd\ubaa8\ud130 \uc815\uc9c0").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_stop_right_motor = function(b, a) {
  Entry.hw.sendQueue.DCR = 0;
  return a.callReturn();
};
Blockly.Blocks.neobot_all_motor = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uc591\ucabd \ubaa8\ud130\ub97c ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"]]), "SPEED").appendField(" \uc758 \uc18d\ub3c4\ub85c ").appendField(new Blockly.FieldDropdown([["\uc804\uc9c4", "1"], ["\ud6c4\uc9c4", "2"], ["\uc81c\uc790\ub9ac \uc88c\ud68c\uc804", "3"], ["\uc81c\uc790\ub9ac \uc6b0\ud68c\uc804", "4"], 
  ["\uc88c\ud68c\uc804", "5"], ["\uc6b0\ud68c\uc804", "6"]]), "DIRECTION").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_all_motor = function(b, a) {
  a.getNumberField("TYPE");
  var d = a.getNumberField("SPEED");
  switch(a.getNumberField("DIRECTION")) {
    case 1:
      Entry.hw.sendQueue.DCL = 16 + d;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 2:
      Entry.hw.sendQueue.DCL = 32 + d;
      Entry.hw.sendQueue.DCR = 32 + d;
      break;
    case 3:
      Entry.hw.sendQueue.DCL = 32 + d;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 4:
      Entry.hw.sendQueue.DCL = 16 + d;
      Entry.hw.sendQueue.DCR = 32 + d;
      break;
    case 5:
      Entry.hw.sendQueue.DCL = 0;
      Entry.hw.sendQueue.DCR = 16 + d;
      break;
    case 6:
      Entry.hw.sendQueue.DCL = 16 + d, Entry.hw.sendQueue.DCR = 0;
  }
  return a.callReturn();
};
Blockly.Blocks.neobot_set_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ud3ec\ud2b8\uc758 \uc11c\ubcf4\ubaa8\ud130\ub97c").appendField(new Blockly.FieldDropdown([["0\ub3c4", "0"], ["10\ub3c4", "10"], ["20\ub3c4", "20"], ["30\ub3c4", "30"], ["40\ub3c4", "40"], ["50\ub3c4", "50"], ["60\ub3c4", "60"], ["70\ub3c4", "70"], ["80\ub3c4", "80"], ["90\ub3c4", "90"], ["100\ub3c4", "100"], ["110\ub3c4", "110"], ["120\ub3c4", "120"], ["130\ub3c4", 
  "130"], ["140\ub3c4", "140"], ["150\ub3c4", "150"], ["160\ub3c4", "160"], ["170\ub3c4", "170"], ["180\ub3c4", "180"]]), "DEGREE").appendField(" \uc774\ub3d9").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_servo = function(b, a) {
  var d = a.getNumberField("PORT"), c = a.getNumberField("DEGREE");
  Entry.hw.sendQueue["OUT" + d] = c;
  3 === d && (d = 4);
  Entry.hw.sendQueue.OPT |= d;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_output = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["OUT1", "1"], ["OUT2", "2"], ["OUT3", "3"]]), "PORT").appendField("\ubc88 \ud3ec\ud2b8\uc758 \uac12\uc744");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ub9cc\ud07c \ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_output = function(b, a) {
  var d = a.getStringField("PORT", a), c = a.getNumberValue("VALUE", a), e = d;
  0 > c ? c = 0 : 255 < c && (c = 255);
  3 === e && (e = 4);
  Entry.hw.sendQueue["OUT" + d] = c;
  Entry.hw.sendQueue.OPT &= ~e;
  return a.callReturn();
};
Blockly.Blocks.neobot_set_fnd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("FND\uc5d0");
  this.appendValueInput("VALUE").setCheck(["Number"]);
  this.appendDummyInput().appendField("\ucd9c\ub825").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_set_fnd = function(b, a) {
  var d = a.getNumberValue("VALUE", a);
  255 < d ? d = 255 : 0 > d && (d = 0);
  Entry.hw.sendQueue.FND = d;
  return a.callReturn();
};
Blockly.Blocks.neobot_play_note_for = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("\uba5c\ub85c\ub514").appendField(new Blockly.FieldDropdown([["\ubb34\uc74c", "0"], [Lang.General.note_c, "1"], [Lang.General.note_c + "#", "2"], [Lang.General.note_d, "3"], [Lang.General.note_d + "#", "4"], [Lang.General.note_e, "5"], [Lang.General.note_f, "6"], [Lang.General.note_f + "#", "7"], [Lang.General.note_g, "8"], [Lang.General.note_g + "#", "9"], [Lang.General.note_a, "10"], [Lang.General.note_a + "#", "11"], [Lang.General.note_b, "12"]]), "NOTE").appendField("\uc744(\ub97c)").appendField(new Blockly.FieldDropdown([["1", 
  "0"], ["2", "1"], ["3", "2"], ["4", "3"], ["5", "4"], ["6", "5"]]), "OCTAVE").appendField("\uc625\ud0c0\ube0c\ub85c").appendField(new Blockly.FieldDropdown([["2\ubd84\uc74c\ud45c", "2"], ["4\ubd84\uc74c\ud45c", "4"], ["8\ubd84\uc74c\ud45c", "8"], ["16\ubd84\uc74c\ud45c", "16"]]), "DURATION");
  this.appendDummyInput().appendField("\uae38\uc774\ub9cc\ud07c \uc18c\ub9ac\ub0b4\uae30").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.neobot_play_note_for = function(b, a) {
  var d = Entry.hw.sendQueue;
  if (a.isStart) {
    if (1 == a.timeFlag) {
      return a;
    }
    delete a.timeFlag;
    delete a.isStart;
    Entry.hw.sendQueue.SND = 0;
    Entry.engine.isContinue = !1;
    return a.callReturn();
  }
  var c = a.getNumberField("NOTE", a), e = a.getNumberField("OCTAVE", a), f = a.getNumberField("DURATION", a), c = c + 12 * e;
  a.isStart = !0;
  a.timeFlag = 1;
  65 < c && (c = 65);
  d.SND = c;
  setTimeout(function() {
    a.timeFlag = 0;
  }, 1 / f * 2E3);
  return a;
};
Entry.Robotis_carCont = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED:[67, 1], CM_SPRING_RIGHT:[69, 1, 69, 2], CM_SPRING_LEFT:[70, 1, 69, 2], CM_SWITCH:[71, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_IR_LEFT:[91, 2, 91, 4], CM_IR_RIGHT:[93, 2, 91, 4], CM_CALIBRATION_LEFT:[95, 2], CM_CALIBRATION_RIGHT:[97, 2], AUX_MOTOR_SPEED_LEFT:[152, 2], AUX_MOTOR_SPEED_RIGHT:[154, 2]}, setZero:function() {
  this.setRobotisData([[Entry.Robotis_carCont.INSTRUCTION.WRITE, 152, 2, 0], [Entry.Robotis_carCont.INSTRUCTION.WRITE, 154, 2, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  this.update();
  this.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  this.update();
}, name:"robotis_carCont", delay:40, postCallReturn:function(b, a, d) {
  if (0 >= d) {
    return this.setRobotisData(a), this.update(), b.callReturn();
  }
  if (b.isStart) {
    if (1 == b.timeFlag) {
      return this.setRobotisData(null), b;
    }
    delete b.timeFlag;
    delete b.isStart;
    Entry.engine.isContinue = !1;
    this.update();
    return b.callReturn();
  }
  b.isStart = !0;
  b.timeFlag = 1;
  this.setRobotisData(a);
  setTimeout(function() {
    b.timeFlag = 0;
  }, d);
  return b;
}, wait:function(b, a) {
  Entry.hw.socket.send(JSON.stringify(b));
  for (var d = (new Date).getTime(), c = d;c < d + a;) {
    c = (new Date).getTime();
  }
}, update:function() {
  Entry.hw.update();
  this.setRobotisData(null);
}, setRobotisData:function(b) {
  Entry.hw.sendQueue.ROBOTIS_DATA = null == b ? null : Entry.hw.sendQueue.ROBOTIS_DATA ? Entry.hw.sendQueue.ROBOTIS_DATA.concat(b) : b;
}};
Entry.Robotis_openCM70 = {INSTRUCTION:{NONE:0, WRITE:3, READ:2}, CONTROL_TABLE:{CM_LED_R:[79, 1], CM_LED_G:[80, 1], CM_LED_B:[81, 1], CM_BUZZER_INDEX:[84, 1], CM_BUZZER_TIME:[85, 1], CM_SOUND_DETECTED:[86, 1], CM_SOUND_DETECTING:[87, 1], CM_USER_BUTTON:[26, 1], CM_MOTION:[66, 1], AUX_SERVO_POSITION:[152, 2], AUX_IR:[168, 2], AUX_TOUCH:[202, 1], AUX_TEMPERATURE:[234, 1], AUX_ULTRASONIC:[242, 1], AUX_MAGNETIC:[250, 1], AUX_MOTION_DETECTION:[258, 1], AUX_COLOR:[266, 1], AUX_CUSTOM:[216, 2], AUX_BRIGHTNESS:[288, 
2], AUX_HYDRO_THEMO_HUMIDITY:[274, 1], AUX_HYDRO_THEMO_TEMPER:[282, 1], AUX_SERVO_MODE:[126, 1], AUX_SERVO_SPEED:[136, 2], AUX_MOTOR_SPEED:[136, 2], AUX_LED_MODULE:[210, 1]}, setZero:function() {
  Entry.Robotis_carCont.setRobotisData([[Entry.Robotis_openCM70.INSTRUCTION.WRITE, 136, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 138, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 140, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 142, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 144, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 146, 2, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 79, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 80, 1, 0], [Entry.Robotis_openCM70.INSTRUCTION.WRITE, 
  81, 1, 0]]);
  Entry.hw.sendQueue.setZero = [1];
  Entry.Robotis_carCont.update();
  Entry.Robotis_carCont.setRobotisData(null);
  Entry.hw.sendQueue.setZero = null;
  Entry.Robotis_carCont.update();
}, name:"robotis_openCM70", delay:15};
Blockly.Blocks.robotis_openCM70_cm_custom_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["BYTE", "BYTE"], ["WORD", "WORD"], ["DWORD", "DWORD"]]), "SIZE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_openCM70_cm_custom_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, c = a.getStringField("SIZE");
  "BYTE" == c ? e = 1 : "WORD" == c ? e = 2 : "DWORD" == c && (e = 4);
  f = c = a.getNumberValue("VALUE");
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, e]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"]);
  b.push([Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"]);
  b.push([Lang.Blocks.robotis_cm_user_button, "CM_USER_BUTTON"]);
  return b;
}};
Entry.block.robotis_openCM70_sensor_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_USER_BUTTON" == h && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_USER_BUTTON[1]);
  f += 0 * g;
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_aux_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.portList()), "PORT");
  this.appendDummyInput().appendField(" ");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown(this.sensorList()), "SENSOR");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, portList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_common_port_3, "PORT_3"]);
  b.push([Lang.Blocks.robotis_common_port_4, "PORT_4"]);
  b.push([Lang.Blocks.robotis_common_port_5, "PORT_5"]);
  b.push([Lang.Blocks.robotis_common_port_6, "PORT_6"]);
  return b;
}, sensorList:function() {
  var b = [];
  b.push([Lang.Blocks.robotis_aux_servo_position, "AUX_SERVO_POSITION"]);
  b.push([Lang.Blocks.robotis_aux_ir, "AUX_IR"]);
  b.push([Lang.Blocks.robotis_aux_touch, "AUX_TOUCH"]);
  b.push([Lang.Blocks.robotis_aux_brightness, "AUX_BRIGHTNESS"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_humidity, "AUX_HYDRO_THEMO_HUMIDITY"]);
  b.push([Lang.Blocks.robotis_aux_hydro_themo_temper, "AUX_HYDRO_THEMO_TEMPER"]);
  b.push([Lang.Blocks.robotis_aux_temperature, "AUX_TEMPERATURE"]);
  b.push([Lang.Blocks.robotis_aux_ultrasonic, "AUX_ULTRASONIC"]);
  b.push([Lang.Blocks.robotis_aux_magnetic, "AUX_MAGNETIC"]);
  b.push([Lang.Blocks.robotis_aux_motion_detection, "AUX_MOTION_DETECTION"]);
  b.push([Lang.Blocks.robotis_aux_color, "AUX_COLOR"]);
  b.push([Lang.Blocks.robotis_aux_custom, "AUX_CUSTOM"]);
  return b;
}};
Entry.block.robotis_openCM70_aux_sensor_value = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("PORT"), k = a.getStringField("SENSOR"), l = 0;
  "PORT_3" == h ? l = 2 : "PORT_4" == h ? l = 3 : "PORT_5" == h ? l = 4 : "PORT_6" == h && (l = 5);
  "AUX_SERVO_POSITION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1]) : "AUX_IR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_IR[1]) : 
  "AUX_TOUCH" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TOUCH[1]) : "AUX_TEMPERATURE" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_TEMPERATURE[1]) : 
  "AUX_BRIGHTNESS" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_BRIGHTNESS[1]) : "AUX_HYDRO_THEMO_HUMIDITY" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[0], 
  e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_HUMIDITY[1]) : "AUX_HYDRO_THEMO_TEMPER" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_HYDRO_THEMO_TEMPER[1]) : "AUX_ULTRASONIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_ULTRASONIC[1]) : "AUX_MAGNETIC" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MAGNETIC[1]) : "AUX_MOTION_DETECTION" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTION_DETECTION[1]) : "AUX_COLOR" == k ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1], c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_COLOR[1]) : "AUX_CUSTOM" == k && (f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1], 
  c = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1]);
  f += l * g;
  0 != l && (e = 6 * g);
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_index = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_index);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.note_a + "(0)", "0"], [Lang.General.note_a + "#(1)", "1"], [Lang.General.note_b + "(2)", "2"], [Lang.General.note_c + "(3)", "3"], [Lang.General.note_c + "#(4)", "4"], [Lang.General.note_d + "(5)", "5"], [Lang.General.note_d + "#(6)", "6"], [Lang.General.note_e + "(7)", "7"], [Lang.General.note_f + "(8)", "8"], [Lang.General.note_f + "#(9)", "9"], [Lang.General.note_g + "(10)", "10"], [Lang.General.note_g + "#(11)", "11"], 
  [Lang.General.note_a + "(12)", "12"], [Lang.General.note_a + "#(13)", "13"], [Lang.General.note_b + "(14)", "14"], [Lang.General.note_c + "(15)", "15"], [Lang.General.note_c + "#(16)", "16"], [Lang.General.note_d + "(17)", "17"], [Lang.General.note_d + "#(18)", "18"], [Lang.General.note_e + "(19)", "19"], [Lang.General.note_f + "(20)", "20"], [Lang.General.note_f + "#(21)", "21"], [Lang.General.note_g + "(22)", "22"], [Lang.General.note_g + "#(23)", "23"], [Lang.General.note_a + "(24)", "24"], 
  [Lang.General.note_a + "#(25)", "25"], [Lang.General.note_b + "(26)", "26"], [Lang.General.note_c + "(27)", "27"], [Lang.General.note_c + "#(28)", "28"], [Lang.General.note_d + "(29)", "29"], [Lang.General.note_d + "#(30)", "30"], [Lang.General.note_e + "(31)", "31"], [Lang.General.note_f + "(32)", "32"], [Lang.General.note_f + "#(33)", "33"], [Lang.General.note_g + "(34)", "34"], [Lang.General.note_g + "#(35)", "35"], [Lang.General.note_a + "(36)", "36"], [Lang.General.note_a + "#(37)", "37"], 
  [Lang.General.note_b + "(38)", "38"], [Lang.General.note_c + "(39)", "39"], [Lang.General.note_c + "#(40)", "40"], [Lang.General.note_d + "(41)", "41"], [Lang.General.note_d + "#(42)", "42"], [Lang.General.note_e + "(43)", "43"], [Lang.General.note_f + "(44)", "44"], [Lang.General.note_f + "#(45)", "45"], [Lang.General.note_g + "(46)", "46"], [Lang.General.note_g + "#(47)", "47"], [Lang.General.note_a + "(48)", "48"], [Lang.General.note_a + "#(49)", "49"], [Lang.General.note_b + "(50)", "50"], 
  [Lang.General.note_c + "(51)", "51"]]), "CM_BUZZER_INDEX").appendField(Lang.Blocks.LOOKS_dialog_time_2);
  this.appendValueInput("CM_BUZZER_TIME").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.LOOKS_dialog_time_3).appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_index = function(b, a) {
  var d = a.getField("CM_BUZZER_INDEX", a), c = a.getNumberValue("CM_BUZZER_TIME", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, k = 0, l = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], h = parseInt(10 * c);
  50 < h && (h = 50);
  k = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0];
  l = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h], [e, k, l, d]], 1E3 * c);
};
Blockly.Blocks.robotis_openCM70_cm_buzzer_melody = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_buzzer_melody);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"], ["20", "20"], ["21", "21"], ["22", "22"], ["23", "23"], ["24", "24"]]), "CM_BUZZER_MELODY");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_buzzer).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_buzzer_melody = function(b, a) {
  var d = a.getField("CM_BUZZER_MELODY", a), c = Entry.Robotis_openCM70.INSTRUCTION.WRITE, e = 0, f = 0, g = 0, h = 0, e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[0], f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_TIME[1], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.CM_BUZZER_INDEX[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[c, e, f, 255], [c, g, h, d]], 1E3);
};
Blockly.Blocks.robotis_openCM70_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_sound_detected_clear = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, 0]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_cm);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_red_color, "CM_LED_R"], [Lang.Blocks.robotis_common_green_color, "CM_LED_G"], [Lang.Blocks.robotis_common_blue_color, "CM_LED_B"]]), "CM_LED").appendField("LED").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_led = function(b, a) {
  var d = a.getField("CM_LED", a), c = a.getField("VALUE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0;
  "CM_LED_R" == d ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_R[1]) : "CM_LED_G" == d ? (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_G[1]) : "CM_LED_B" == d && (f = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.CM_LED_B[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_motion = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_motion);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_index_number);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_play_motion).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_motion = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, f = 0, c = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[0], e = Entry.Robotis_openCM70.CONTROL_TABLE.CM_MOTION[1], f = a.getNumberValue("VALUE", a);
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, f]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_1, "1"], [Lang.Blocks.robotis_common_port_2, "2"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_motor_speed = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_MOTOR_SPEED[1];
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (d - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_mode = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_mode_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_wheel_mode, "0"], [Lang.Blocks.robotis_common_joint_mode, "1"]]), "MODE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_mode = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("MODE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_MODE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_openCM70_aux_servo_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_speed = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_openCM70.INSTRUCTION.WRITE, g = 0, h = 0, g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[0], h = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_SPEED[1];
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g + (d - 1) * h, h, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_servo_position = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_servo_position_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_servo_position = function(b, a) {
  var d = a.getField("PORT", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_SERVO_POSITION[1];
  1023 < c ? c = 1023 : 0 > c && (c = 0);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_led_module = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_led_module_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_off, "0"], [Lang.Blocks.robotis_cm_led_right + Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_cm_led_left + 
  Lang.Blocks.robotis_common_on, "2"], [Lang.Blocks.robotis_cm_led_both + Lang.Blocks.robotis_common_on, "3"]]), "LED_MODULE");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_led_module = function(b, a) {
  var d = a.getField("PORT", a), c = a.getField("LED_MODULE", a), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_LED_MODULE[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_aux_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_port_3, "3"], [Lang.Blocks.robotis_common_port_4, "4"], [Lang.Blocks.robotis_common_port_5, "5"], [Lang.Blocks.robotis_common_port_6, "6"]]), "PORT").appendField(Lang.Blocks.robotis_openCM70_aux_custom_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_aux_custom = function(b, a) {
  var d = a.getField("PORT", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_openCM70.INSTRUCTION.WRITE, f = 0, g = 0, f = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[0], g = Entry.Robotis_openCM70.CONTROL_TABLE.AUX_CUSTOM[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f + (d - 1) * g, g, c]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_openCM70_cm_custom = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_custom);
  this.appendDummyInput().appendField("(");
  this.appendValueInput("ADDRESS").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(")");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_case_01);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_openCM70_cm_custom = function(b, a) {
  var d = Entry.Robotis_openCM70.INSTRUCTION.WRITE, c = 0, e = 0, c = a.getNumberValue("ADDRESS"), e = a.getNumberValue("VALUE");
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, 65535 < e ? 4 : 255 < e ? 2 : 1, e]], Entry.Robotis_openCM70.delay);
};
Blockly.Blocks.robotis_carCont_sensor_value = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_cm_spring_left, "CM_SPRING_LEFT"], [Lang.Blocks.robotis_cm_spring_right, "CM_SPRING_RIGHT"], [Lang.Blocks.robotis_cm_switch, "CM_SWITCH"], [Lang.Blocks.robotis_cm_sound_detected, "CM_SOUND_DETECTED"], [Lang.Blocks.robotis_cm_sound_detecting, "CM_SOUND_DETECTING"], [Lang.Blocks.robotis_cm_ir_left, "CM_IR_LEFT"], [Lang.Blocks.robotis_cm_ir_right, "CM_IR_RIGHT"], [Lang.Blocks.robotis_cm_calibration_left, 
  "CM_CALIBRATION_LEFT"], [Lang.Blocks.robotis_cm_calibration_right, "CM_CALIBRATION_RIGHT"]]), "SENSOR").appendField(" ").appendField(Lang.Blocks.robotis_common_value);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.robotis_carCont_sensor_value = function(b, a) {
  var d = Entry.Robotis_carCont.INSTRUCTION.READ, c = 0, e = 0, f = 0, g = 0, h = a.getStringField("SENSOR");
  "CM_SPRING_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_LEFT[3]) : "CM_SPRING_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SPRING_RIGHT[3]) : 
  "CM_SWITCH" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SWITCH[1]) : "CM_SOUND_DETECTED" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1]) : 
  "CM_SOUND_DETECTING" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTING[1]) : "CM_IR_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_LEFT[3]) : 
  "CM_IR_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[2], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_IR_RIGHT[3]) : "CM_CALIBRATION_LEFT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : 
  "CM_CALIBRATION_RIGHT" == h ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]) : "CM_BUTTON_STATUS" == h && (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1], c = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[0], 
  e = Entry.Robotis_carCont.CONTROL_TABLE.CM_BUTTON_STATUS[1]);
  Entry.Robotis_carCont.setRobotisData([[d, c, e, 0, g]]);
  Entry.Robotis_carCont.update();
  return Entry.hw.portData[f];
};
Blockly.Blocks.robotis_carCont_cm_led = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_led_4).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_LEFT").appendField(", ").appendField(Lang.Blocks.robotis_cm_led_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_on, "1"], [Lang.Blocks.robotis_common_off, "0"]]), "VALUE_RIGHT").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_led = function(b, a) {
  var d = a.getField("VALUE_LEFT", a), c = a.getField("VALUE_RIGHT", a), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0, h = 0, f = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_LED[1];
  1 == d && 1 == c ? h = 9 : 1 == d && 0 == c && (h = 8);
  0 == d && 1 == c && (h = 1);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, h]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_sound_detected_clear = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.robotis_cm_clear_sound_detected).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_sound_detected_clear = function(b, a) {
  var d = Entry.Robotis_carCont.INSTRUCTION.WRITE, c = 0, e = 0, c = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[0], e = Entry.Robotis_carCont.CONTROL_TABLE.CM_SOUND_DETECTED[1];
  return Entry.Robotis_carCont.postCallReturn(a, [[d, c, e, 0]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_aux_motor_speed = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.robotis_common_clockwhise, "CW"], [Lang.Blocks.robotis_common_counter_clockwhise, "CCW"]]), "DIRECTION_ANGLE").appendField(Lang.Blocks.robotis_carCont_aux_motor_speed_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_aux_motor_speed = function(b, a) {
  var d = a.getField("DIRECTION", a), c = a.getField("DIRECTION_ANGLE", a), e = a.getNumberValue("VALUE"), f = Entry.Robotis_carCont.INSTRUCTION.WRITE, g = 0, h = 0;
  "LEFT" == d ? (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_LEFT[1]) : (g = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[0], h = Entry.Robotis_carCont.CONTROL_TABLE.AUX_MOTOR_SPEED_RIGHT[1]);
  "CW" == c ? (e += 1024, 2047 < e && (e = 2047)) : 1023 < e && (e = 1023);
  return Entry.Robotis_carCont.postCallReturn(a, [[f, g, h, e]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.robotis_carCont_cm_calibration = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.General.left, "LEFT"], [Lang.General.right, "RIGHT"]]), "DIRECTION").appendField(Lang.Blocks.robotis_carCont_calibration_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.robotis_common_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.robotis_carCont_cm_calibration = function(b, a) {
  var d = a.getField("DIRECTION", a), c = a.getNumberValue("VALUE"), e = Entry.Robotis_carCont.INSTRUCTION.WRITE, f = 0, g = 0;
  "LEFT" == d ? (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_LEFT[1]) : (f = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[0], g = Entry.Robotis_carCont.CONTROL_TABLE.CM_CALIBRATION_RIGHT[1]);
  return Entry.Robotis_carCont.postCallReturn(a, [[e, f, g, c]], Entry.Robotis_carCont.delay);
};
Blockly.Blocks.when_scene_start = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_scene_1_2.png", "*", "start")).appendField(Lang.Blocks.SCENE_when_scene_start);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_scene()"]}};
Entry.block.when_scene_start = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.start_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_scene_1).appendField(new Blockly.FieldDropdownDynamic("scenes"), "VALUE").appendField(Lang.Blocks.SCENE_start_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_scene(%1)"]}};
Entry.block.start_scene = function(b, a) {
  var d = a.getField("VALUE", a);
  if (d = Entry.scene.getSceneById(d)) {
    Entry.scene.selectScene(d), Entry.engine.fireEvent("when_scene_start");
  }
  return null;
};
Blockly.Blocks.start_neighbor_scene = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.SCENE_start_neighbor_scene_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.SCENE_start_scene_next, "next"], [Lang.Blocks.SCENE_start_scene_pre, "pre"]]), "OPERATOR").appendField(Lang.Blocks.SCENE_start_neighbor_scene_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:['Entry.start_neighbor_scene("%1")']}};
Entry.block.start_neighbor_scene = function(b, a) {
  var d = Entry.scene.selectedScene, c = Entry.scene.getScenes(), d = c.indexOf(d);
  "next" == a.getField("OPERATOR", a) ? d + 1 < c.length && (c = Entry.scene.getSceneById(c[d + 1].id)) && (Entry.scene.selectScene(c), Entry.engine.fireEvent("when_scene_start")) : 0 < d && (c = Entry.scene.getSceneById(c[d - 1].id)) && (Entry.scene.selectScene(c), Entry.engine.fireEvent("when_scene_start"));
  return null;
};
Blockly.Blocks.sound_something = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something = function(b, a) {
  var d = a.getField("VALUE", a);
  Entry.isExist(d, "id", b.parent.sounds) && createjs.Sound.play(d);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second = function(b, a) {
  var d = a.getField("VALUE", a), c = a.getNumberValue("SECOND", a);
  if (Entry.isExist(d, "id", b.parent.sounds)) {
    var e = createjs.Sound.play(d);
    setTimeout(function() {
      e.stop();
    }, 1E3 * c);
  }
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var d = a.getField("VALUE", a), c = b.parent.getSound(d);
  Entry.isExist(d, "id", b.parent.sounds) && (createjs.Sound.play(d), setTimeout(function() {
    a.playState = 0;
  }, 1E3 * c.duration));
  return a;
};
Blockly.Blocks.sound_something_second_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2);
  this.appendValueInput("SECOND").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}};
Entry.block.sound_something_second_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var d = a.getField("VALUE", a);
  if (Entry.isExist(d, "id", b.parent.sounds)) {
    var c = createjs.Sound.play(d), d = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      c.stop();
      a.playState = 0;
    }, 1E3 * d);
    c.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_volume_change = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_change_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.change_volume_by_percent(%1)"]}};
Entry.block.sound_volume_change = function(b, a) {
  var d = a.getNumberValue("VALUE", a) / 100, d = d + createjs.Sound.getVolume();
  1 < d && (d = 1);
  0 > d && (d = 0);
  createjs.Sound.setVolume(d);
  return a.callReturn();
};
Blockly.Blocks.sound_volume_set = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_volume_set_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.set_volume_by_percent(%1)"]}};
Entry.block.sound_volume_set = function(b, a) {
  var d = a.getNumberValue("VALUE", a) / 100;
  1 < d && (d = 1);
  0 > d && (d = 0);
  createjs.Sound.setVolume(d);
  return a.callReturn();
};
Blockly.Blocks.sound_silent_all = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_silent_all).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.stop_all_sounds()"]}};
Entry.block.sound_silent_all = function(b, a) {
  createjs.Sound.stop();
  return a.callReturn();
};
Blockly.Blocks.get_sounds = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField("");
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("sounds"), "VALUE");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.get_sounds = function(b, a) {
  return a.getStringField("VALUE");
};
Blockly.Blocks.sound_something_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound(%1)"]}};
Entry.block.sound_something_with_block = function(b, a) {
  var d = a.getStringValue("VALUE", a);
  (d = b.parent.getSound(d)) && createjs.Sound.play(d.id);
  return a.callReturn();
};
Blockly.Blocks.sound_something_second_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(" ").appendField(Lang.Blocks.SOUND_sound_something_second_2);
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_for_seconds(%1, %2)"]}};
Entry.block.sound_something_second_with_block = function(b, a) {
  var d = a.getStringValue("VALUE", a), c = a.getNumberValue("SECOND", a);
  (d = b.parent.getSound(d)) && createjs.Sound.play(d.id, {startTime:0, duration:1E3 * c});
  return a.callReturn();
};
Blockly.Blocks.sound_something_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_and_wait(%1)"]}};
Entry.block.sound_something_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.playState;
    delete a.isPlay;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var d = a.getStringValue("VALUE", a);
  if (d = b.parent.getSound(d)) {
    createjs.Sound.play(d.id), setTimeout(function() {
      a.playState = 0;
    }, 1E3 * d.duration);
  }
  return a;
};
Blockly.Blocks.sound_something_second_wait_with_block = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_2).appendField(" ");
  this.appendValueInput("SECOND").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_something_second_wait_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_for_seconds_and_wait(%1, %2)"]}};
Entry.block.sound_something_second_wait_with_block = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var d = a.getStringValue("VALUE", a);
  if (d = b.parent.getSound(d)) {
    var c = createjs.Sound.play(d.id), d = a.getNumberValue("SECOND", a);
    setTimeout(function() {
      c.stop();
      a.playState = 0;
    }, 1E3 * d);
    c.addEventListener("complete", function(a) {
    });
  }
  return a;
};
Blockly.Blocks.sound_from_to = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_from_to_seconds(%1, %2, %3)"]}};
Entry.block.sound_from_to = function(b, a) {
  var d = a.getStringValue("VALUE", a);
  if (d = b.parent.getSound(d)) {
    var c = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a);
    createjs.Sound.play(d.id, {startTime:Math.min(c, e), duration:Math.max(c, e) - Math.min(c, e)});
  }
  return a.callReturn();
};
Blockly.Blocks.sound_from_to_and_wait = {init:function() {
  this.setColour("#A4D01D");
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_2);
  this.appendValueInput("START").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_3);
  this.appendValueInput("END").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.SOUND_sound_from_to_and_wait_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/sound_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.play_sound_from_to_seconds_and_wait(%1, %2, %3)"]}};
Entry.block.sound_from_to_and_wait = function(b, a) {
  if (a.isPlay) {
    if (1 == a.playState) {
      return a;
    }
    delete a.isPlay;
    delete a.playState;
    return a.callReturn();
  }
  a.isPlay = !0;
  a.playState = 1;
  var d = a.getStringValue("VALUE", a);
  if (d = b.parent.getSound(d)) {
    var c = 1E3 * a.getNumberValue("START", a), e = 1E3 * a.getNumberValue("END", a), f = Math.min(c, e), c = Math.max(c, e) - f;
    createjs.Sound.play(d.id, {startTime:f, duration:c});
    setTimeout(function() {
      a.playState = 0;
    }, c);
  }
  return a;
};
Blockly.Blocks.when_run_button_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_play.png", "*", "start")).appendField(Lang.Blocks.START_when_run_button_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_start_button_click()"]}};
Entry.block.when_run_button_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.press_some_key = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldDropdown([["q", "81"], ["w", "87"], ["e", "69"], ["r", "82"], ["a", "65"], ["s", "83"], ["d", "68"], [Lang.Blocks.START_press_some_key_up, "38"], [Lang.Blocks.START_press_some_key_down, "40"], [Lang.Blocks.START_press_some_key_left, "37"], [Lang.Blocks.START_press_some_key_right, "39"], [Lang.Blocks.START_press_some_key_enter, 
  "13"], [Lang.Blocks.START_press_some_key_space, "32"]]), "VALUE").appendField(Lang.Blocks.START_press_some_key_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.is_key_pressed()"]}};
Entry.block.press_some_key = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_pressed = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_press_some_key_1).appendField(new Blockly.FieldKeydownInput("81"), "VALUE").appendField(Lang.Blocks.START_press_some_key_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_key_press(%1)"]}};
Entry.block.when_some_key_pressed = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_clicked = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_clicked);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_mouse_click_down()"]}};
Entry.block.mouse_clicked = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.mouse_click_cancled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_mouse_click_cancled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_mouse_click_up()"]}};
Entry.block.mouse_click_cancled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_object_click_down()"]}};
Entry.block.when_object_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_object_click_canceled = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_mouse.png", "*", "start")).appendField(Lang.Blocks.START_when_object_click_canceled);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_object_click_up()"]}};
Entry.block.when_object_click_canceled = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_some_key_click = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_keyboard.png", "*", "start")).appendField(Lang.Blocks.START_when_some_key_click);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_key_press_down(%1)"]}};
Entry.block.when_some_key_click = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.when_message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_icon_signal.png", "*", "start")).appendField(Lang.Blocks.START_when_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_when_message_cast_2);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
}, syntax:{js:[], py:["Entry.on_signal_receive(%1)"]}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.when_message_cast = function(b, a) {
  return a.callReturn();
};
Blockly.Blocks.message_cast = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_cast_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_cast_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.send_signal(%1)"]}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.message_cast = function(b, a) {
  var d = a.getField("VALUE", a), c = Entry.isExist(d, "id", Entry.variableContainer.messages_);
  if ("null" == d || !c) {
    throw Error("value can not be null or undefined");
  }
  Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", d]);
  return a.callReturn();
};
Blockly.Blocks.message_cast_wait = {init:function() {
  this.setColour("#3BBD70");
  this.appendDummyInput().appendField(Lang.Blocks.START_message_send_wait_1).appendField(new Blockly.FieldDropdownDynamic("messages"), "VALUE").appendField(Lang.Blocks.START_message_send_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/start_03.png", "*"));
  this.setInputsInline(!0);
  this.setNextStatement(!0);
  this.setPreviousStatement(!0);
}, syntax:{js:[], py:["Entry.send_signal_and_wait(%1)"]}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_messageRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_messageRefs", b);
}};
Entry.block.message_cast_wait = function(b, a) {
  if (a.runningScript) {
    for (var d = a.runningScript, c = d.length, e = 0;e < c;e++) {
      var f = d.shift();
      f && !f.isEnd() && d.push(f);
    }
    return d.length ? a : a.callReturn();
  }
  d = a.getField("VALUE", a);
  f = Entry.isExist(d, "id", Entry.variableContainer.messages_);
  if ("null" == d || !f) {
    throw Error("value can not be null or undefined");
  }
  c = Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["when_message_cast", d]);
  for (d = [];c.length;) {
    (f = c.shift()) && (d = d.concat(f));
  }
  a.runningScript = d;
  return a;
};
var colour = "#FFCA36";
Blockly.Blocks.text = {init:function() {
  this.setColour("#FFD974");
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(Lang.Blocks.TEXT_text), "NAME");
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}, syntax:{js:[], py:["%1"]}};
Entry.block.text = function(b, a) {
  return a.getField("NAME", a);
};
Blockly.Blocks.text_write = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_write_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_write = function(b, a) {
  var d = a.getStringValue("VALUE", a), d = Entry.convertToRoundedDecimals(d, 3);
  b.setText(d);
  return a.callReturn();
};
Blockly.Blocks.text_append = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_append_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_append = function(b, a) {
  var d = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(b.getText(), 3) + Entry.convertToRoundedDecimals(d, 3));
  return a.callReturn();
};
Blockly.Blocks.text_prepend = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_prepend_2);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_prepend = function(b, a) {
  var d = a.getStringValue("VALUE", a);
  b.setText(Entry.convertToRoundedDecimals(d, 3) + Entry.convertToRoundedDecimals(b.getText(), 3));
  return a.callReturn();
};
Blockly.Blocks.text_flush = {init:function() {
  this.setColour(colour);
  this.appendDummyInput().appendField(Lang.Blocks.TEXT_text_flush);
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.text_flush = function(b, a) {
  b.setText("");
  return a.callReturn();
};
Entry.block.variableAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ubcc0\uc218 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("variable");
}]}, syntax:{js:[], py:[]}};
Entry.block.listAddButton = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"\ub9ac\uc2a4\ud2b8 \ucd94\uac00", color:"#333", align:"center"}], func:function() {
}, events:{mousedown:[function() {
  Entry.variableContainer.openVariableAddPanel("list");
}]}, syntax:{js:[], py:[]}};
Blockly.Blocks.change_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.change_variable = function(b, a) {
  var d = a.getField("VARIABLE", a), c = a.getNumberValue("VALUE", a), e = 0, c = Entry.parseNumber(c);
  if (0 == c && "boolean" == typeof c) {
    throw Error("Type is not correct");
  }
  d = Entry.variableContainer.getVariable(d, b);
  e = Entry.getMaxFloatPoint([c, d.getValue()]);
  d.setValue((c + d.getValue()).toFixed(e));
  return a.callReturn();
};
Blockly.Blocks.set_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_2);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_set_variable_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.set_variable = function(b, a) {
  var d = a.getField("VARIABLE", a), c = a.getValue("VALUE", a);
  Entry.variableContainer.getVariable(d, b).setValue(c);
  return a.callReturn();
};
Blockly.Blocks.show_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_show_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.show_variable = function(b, a) {
  var d = a.getField("VARIABLE", a), d = Entry.variableContainer.getVariable(d, b);
  d.setVisible(!0);
  d.updateView();
  return a.callReturn();
};
Blockly.Blocks.hide_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_hide_variable_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.hide_variable = function(b, a) {
  var d = a.getField("VARIABLE", a);
  Entry.variableContainer.getVariable(d, b).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.get_y = {init:function() {
  this.setColour(230);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_y).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setOutput(!0, "Number");
}};
Blockly.Blocks.get_variable = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_variable_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("variables"), "VARIABLE").appendField(Lang.Blocks.VARIABLE_get_variable_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.get_variable = function(b, a) {
  var d = a.getField("VARIABLE", a);
  return Entry.variableContainer.getVariable(d, b).getValue();
};
Blockly.Blocks.ask_and_wait = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_1);
  this.appendValueInput("VALUE").setCheck(["String", "Number", null]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_ask_and_wait_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}, syntax:{js:[], py:["Entry.ask_and_wait(%1)\n"]}};
Entry.block.ask_and_wait = function(b, a) {
  var d = Entry.container.inputValue, c = Entry.stage.inputField, e = a.getValue("VALUE", a);
  if (!e) {
    throw Error("message can not be empty");
  }
  if (d.sprite == b && c && !c._isHidden) {
    return a;
  }
  if (d.sprite != b && a.isInit) {
    return b.dialog && b.dialog.remove(), delete a.isInit, a.callReturn();
  }
  if (d.complete && d.sprite == b && c._isHidden && a.isInit) {
    return b.dialog && b.dialog.remove(), delete d.complete, delete a.isInit, a.callReturn();
  }
  e = Entry.convertToRoundedDecimals(e, 3);
  new Entry.Dialog(b, e, "speak");
  Entry.stage.showInputField();
  d.script = a;
  d.sprite = b;
  a.isInit = !0;
  return a;
};
Blockly.Blocks.get_canvas_input_value = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value, "#fff");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}, syntax:{js:[], py:["answer"]}};
Entry.block.get_canvas_input_value = function(b, a) {
  return Entry.container.getInputValue();
};
Blockly.Blocks.add_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_add_value_to_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function(b) {
  var a = Entry.variableContainer;
  a && a.addRef("_variableRefs", b);
}, whenRemove:function(b) {
  var a = Entry.variableContainer;
  a && a.removeRef("_variableRefs", b);
}};
Entry.block.add_value_to_list = function(b, a) {
  var d = a.getField("LIST", a), c = a.getValue("VALUE", a), d = Entry.variableContainer.getList(d, b);
  d.array_ || (d.array_ = []);
  d.array_.push({data:c});
  d.updateView();
  return a.callReturn();
};
Blockly.Blocks.remove_value_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_1);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_remove_value_from_list_3).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.remove_value_from_list = function(b, a) {
  var d = a.getField("LIST", a), c = a.getValue("VALUE", a), d = Entry.variableContainer.getList(d, b);
  if (!d.array_ || isNaN(c) || c > d.array_.length) {
    throw Error("can not remove value from array");
  }
  d.array_.splice(c - 1, 1);
  d.updateView();
  return a.callReturn();
};
Blockly.Blocks.insert_value_to_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_1);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_2);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_3);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_insert_value_to_list_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.insert_value_to_list = function(b, a) {
  var d = a.getField("LIST", a), c = a.getValue("DATA", a), e = a.getValue("INDEX", a), d = Entry.variableContainer.getList(d, b);
  if (!d.array_ || isNaN(e) || 0 == e || e > d.array_.length + 1) {
    throw Error("can not insert value to array");
  }
  d.array_.splice(e - 1, 0, {data:c});
  d.updateView();
  return a.callReturn();
};
Blockly.Blocks.change_value_list_index = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_3);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_change_value_list_index_4).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.change_value_list_index = function(b, a) {
  var d = a.getField("LIST", a), c = a.getValue("DATA", a), e = a.getValue("INDEX", a), d = Entry.variableContainer.getList(d, b);
  if (!d.array_ || isNaN(e) || e > d.array_.length) {
    throw Error("can not insert value to array");
  }
  d.array_[e - 1].data = c;
  d.updateView();
  return a.callReturn();
};
Blockly.Blocks.value_of_index_from_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_2);
  this.appendValueInput("INDEX").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_value_of_index_from_list_3);
  this.setOutput(!0, "String");
  this.setInputsInline(!0);
}};
Entry.block.value_of_index_from_list = function(b, a) {
  var d = a.getField("LIST", a), c = a.getValue("INDEX", a), d = Entry.variableContainer.getList(d, b), c = Entry.getListRealIndex(c, d);
  if (!d.array_ || isNaN(c) || c > d.array_.length) {
    throw Error("can not insert value to array");
  }
  return d.array_[c - 1].data;
};
Blockly.Blocks.length_of_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_length_of_list_2);
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.length_of_list = function(b, a) {
  var d = a.getField("LIST", a);
  return Entry.variableContainer.getList(d).array_.length;
};
Blockly.Blocks.show_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_show_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_show_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.show_list = function(b, a) {
  var d = a.getField("LIST", a);
  Entry.variableContainer.getList(d).setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.hide_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_hide_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST").appendField(Lang.Blocks.VARIABLE_hide_list_2).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.hide_list = function(b, a) {
  var d = a.getField("LIST", a);
  Entry.variableContainer.getList(d).setVisible(!1);
  return a.callReturn();
};
Blockly.Blocks.options_for_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField("");
  this.appendDummyInput("VALUE").appendField(new Blockly.FieldDropdown([[Lang.Blocks.VARIABLE_list_option_first, "FIRST"], [Lang.Blocks.VARIABLE_list_option_last, "LAST"], [Lang.Blocks.VARIABLE_list_option_random, "RANDOM"]]), "OPERATOR");
  this.appendDummyInput().appendField(" ");
  this.setOutput(!0, "Number");
  this.setInputsInline(!0);
}};
Entry.block.options_for_list = function(b, a) {
  return a.getField("OPERATOR", a);
};
Blockly.Blocks.set_visible_answer = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_get_canvas_input_value);
  this.appendDummyInput().appendField(new Blockly.FieldDropdown([[Lang.Blocks.CALC_timer_visible_show, "SHOW"], [Lang.Blocks.CALC_timer_visible_hide, "HIDE"]]), "BOOL");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/variable_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}, whenAdd:function() {
  Entry.container && Entry.container.showProjectAnswer();
}, whenRemove:function(b) {
  Entry.container && Entry.container.hideProjectAnswer(b);
}, syntax:{js:[], py:['Entry.set_visible("%1")\n']}};
Entry.block.set_visible_answer = function(b, a) {
  "HIDE" == a.getField("BOOL", a) ? Entry.container.inputValue.setVisible(!1) : Entry.container.inputValue.setVisible(!0);
  return a.callReturn();
};
Blockly.Blocks.is_included_in_list = {init:function() {
  this.setColour("#E457DC");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_1);
  this.appendDummyInput().appendField(new Blockly.FieldDropdownDynamic("lists"), "LIST");
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_2);
  this.appendValueInput("DATA").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.VARIABLE_is_included_in_list_3);
  this.setOutput(!0, "Boolean");
  this.setInputsInline(!0);
}};
Entry.block.is_included_in_list = function(b, a) {
  var d = a.getField("LIST", a), c = a.getStringValue("DATA", a), d = Entry.variableContainer.getList(d);
  if (!d) {
    return !1;
  }
  for (var d = d.array_, e = 0, f = d.length;e < f;e++) {
    if (d[e].data.toString() == c.toString()) {
      return !0;
    }
  }
  return !1;
};
Entry.Xbot = {PORT_MAP:{rightWheel:0, leftWheel:0, head:90, armR:90, armL:90, analogD5:127, analogD6:127, D4:0, D7:0, D12:0, D13:0, ledR:0, ledG:0, ledB:0, lcdNum:0, lcdTxt:"                ", note:262, duration:0}, setZero:function() {
  var b = Entry.Xbot.PORT_MAP, a = Entry.hw.sendQueue, d;
  for (d in b) {
    a[d] = b[d];
  }
  Entry.hw.update();
  Entry.Xbot.removeAllTimeouts();
}, timeouts:[], removeTimeout:function(b) {
  clearTimeout(b);
  var a = this.timeouts;
  b = a.indexOf(b);
  0 <= b && a.splice(b, 1);
}, removeAllTimeouts:function() {
  var b = this.timeouts, a;
  for (a in b) {
    clearTimeout(b[a]);
  }
  this.timeouts = [];
}, name:"xbot_epor_edge"};
Blockly.Blocks.xbot_digitalInput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_D2_digitalInput, "D2"], [Lang.Blocks.XBOT_D3_digitalInput, "D3"], [Lang.Blocks.XBOT_D11_digitalInput, "D11"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Boolean");
}};
Entry.block.xbot_digitalInput = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.xbot_analogValue = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("").appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_CDS, "light"], [Lang.Blocks.XBOT_MIC, "mic"], [Lang.Blocks.XBOT_analog0, "adc0"], [Lang.Blocks.XBOT_analog1, "adc1"], [Lang.Blocks.XBOT_analog2, "adc2"], [Lang.Blocks.XBOT_analog3, "adc3"]]), "DEVICE");
  this.setInputsInline(!0);
  this.setOutput(!0, "Number");
}};
Entry.block.xbot_analogValue = function(b, a) {
  var d = Entry.hw.portData, c = a.getField("DEVICE");
  return d[c];
};
Blockly.Blocks.xbot_digitalOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_digital).appendField(new Blockly.FieldDropdown([["LED", "D13"], ["D4", "D4"], ["D7", "D7"], ["D12 ", "D12"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_OutputValue).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_High, "HIGH"], [Lang.Blocks.XBOT_Low, "LOW"]]), "VALUE");
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_digitalOutput = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getStringField("VALUE", a);
  d.D13 = "D13" == c && "HIGH" == e ? 1 : 0;
  d.D4 = "D4" == c && "HIGH" == e ? 1 : 0;
  d.D7 = "D7" == c && "HIGH" == e ? 1 : 0;
  d.D12 = "D12" == c && "HIGH" == e ? 1 : 0;
  return a.callReturn();
};
Blockly.Blocks.xbot_analogOutput = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_analog).appendField(new Blockly.FieldDropdown([["D5", "analogD5"], ["D6", "analogD6"]]), "DEVICE").appendField(Lang.Blocks.XBOT_pin_Output_Value);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_analogOutput = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "analogD5" == c ? d.analogD5 = e : "analogD6" == c && (d.analogD6 = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_servo = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_Servo).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_Head, "head"], [Lang.Blocks.XBOT_ArmR, "right"], [Lang.Blocks.XBOT_ArmL, "left"]]), "DEVICE").appendField(Lang.Blocks.XBOT_angle);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_servo = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "head" == c ? d.head = e : "right" == c ? d.armR = e : "left" == c && (d.armL = e);
  return a.callReturn();
};
Blockly.Blocks.xbot_oneWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_DC).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_rightWheel, "rightWheel"], [Lang.Blocks.XBOT_leftWheel, "leftWheel"], [Lang.Blocks.XBOT_bothWheel, "bothWheel"]]), "DEVICE").appendField(Lang.Blocks.XBOT_speed);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_oneWheel = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("DEVICE", a), e = a.getNumberValue("VALUE", a);
  "rightWheel" == c ? d.rightWheel = e : "leftWheel" == c ? d.leftWheel = e : d.rightWheel = d.leftWheel = e;
  return a.callReturn();
};
Blockly.Blocks.xbot_twoWheel = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_rightSpeed);
  this.appendValueInput("rightWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_leftSpeed);
  this.appendValueInput("leftWheel").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_twoWheel = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.rightWheel = a.getNumberValue("rightWheel");
  d.leftWheel = a.getNumberValue("leftWheel");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_R);
  this.appendValueInput("ledR").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_G);
  this.appendValueInput("ledG").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_B);
  this.appendValueInput("ledB").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb = function(b, a) {
  var d = Entry.hw.sendQueue;
  d.ledR = a.getNumberValue("ledR");
  d.ledG = a.getNumberValue("ledG");
  d.ledB = a.getNumberValue("ledB");
  return a.callReturn();
};
Blockly.Blocks.xbot_rgb_picker = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_RGBLED_color).appendField(new Blockly.FieldColour("#ff0000"), "VALUE").appendField(Lang.Blocks.XBOT_set).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_rgb_picker = function(b, a) {
  var d = a.getStringField("VALUE"), c = Entry.hw.sendQueue;
  c.ledR = parseInt(.3 * parseInt(d.substr(1, 2), 16));
  c.ledG = parseInt(.3 * parseInt(d.substr(3, 2), 16));
  c.ledB = parseInt(.3 * parseInt(d.substr(5, 2), 16));
  return a.callReturn();
};
Blockly.Blocks.xbot_buzzer = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField(Lang.Blocks.HAMSTER_play_note_for_1).appendField(new Blockly.FieldDropdown([[Lang.Blocks.XBOT_c, "C"], [Lang.Blocks.XBOT_d, "D"], [Lang.Blocks.XBOT_e, "E"], [Lang.Blocks.XBOT_f, "F"], [Lang.Blocks.XBOT_g, "G"], [Lang.Blocks.XBOT_a, "A"], [Lang.Blocks.XBOT_b, "B"]]), "NOTE").appendField(" ").appendField(new Blockly.FieldDropdown([["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"]]), "OCTAVE").appendField(Lang.Blocks.HAMSTER_play_note_for_3);
  this.appendValueInput("VALUE").setCheck(["Number", "String"]);
  this.appendDummyInput().appendField(Lang.Blocks.XBOT_melody_ms).appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_buzzer = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getStringField("NOTE", a), e = a.getStringField("OCTAVE", a), f = a.getNumberValue("VALUE", a), c = c + e;
  d.note = "C2" == c ? 65 : "D2" == c ? 73 : "E2" == c ? 82 : "F2" == c ? 87 : "G2" == c ? 98 : "A2" == c ? 110 : "B2" == c ? 123 : "C3" == c ? 131 : "D3" == c ? 147 : "E3" == c ? 165 : "F3" == c ? 175 : "G3" == c ? 196 : "A3" == c ? 220 : "B3" == c ? 247 : "C4" == c ? 262 : "D4" == c ? 294 : "E4" == c ? 330 : "F4" == c ? 349 : "G4" == c ? 392 : "A4" == c ? 440 : "B4" == c ? 494 : "C5" == c ? 523 : "D5" == c ? 587 : "E5" == c ? 659 : "F5" == c ? 698 : "G5" == c ? 784 : "A5" == c ? 880 : "B5" == c ? 
  988 : "C6" == c ? 1047 : "D6" == c ? 1175 : "E6" == c ? 1319 : "F6" == c ? 1397 : "G6" == c ? 1568 : "A6" == c ? 1760 : "B6" == c ? 1976 : "C7" == c ? 2093 : "D7" == c ? 2349 : "E7" == c ? 2637 : "F7" == c ? 2794 : "G7" == c ? 3136 : "A7" == c ? 3520 : "B7" == c ? 3951 : 262;
  d.duration = 40 * f;
  return a.callReturn();
};
Blockly.Blocks.xbot_lcd = {init:function() {
  this.setColour("#00979D");
  this.appendDummyInput().appendField("LCD").appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"]]), "LINE").appendField(Lang.Blocks.XBOT_Line).appendField(", ").appendField(Lang.Blocks.XBOT_outputValue);
  this.appendValueInput("VALUE").setCheck(["String", "Number"]);
  this.appendDummyInput().appendField(new Blockly.FieldIcon(Entry.mediaFilePath + "block_icon/hardware_03.png", "*"));
  this.setInputsInline(!0);
  this.setPreviousStatement(!0);
  this.setNextStatement(!0);
}};
Entry.block.xbot_lcd = function(b, a) {
  var d = Entry.hw.sendQueue, c = a.getNumberField("LINE", a), e = a.getStringValue("VALUE", a);
  0 == c ? (d.lcdNum = 0, d.lcdTxt = e) : 1 == c && (d.lcdNum = 1, d.lcdTxt = e);
  return a.callReturn();
};
Entry.Collection = function(b) {
  this.length = 0;
  this._hashMap = {};
  this._observers = [];
  this.set(b);
};
(function(b, a) {
  b.set = function(b) {
    for (;this.length;) {
      a.pop.call(this);
    }
    var c = this._hashMap, e;
    for (e in c) {
      delete c[e];
    }
    if (void 0 !== b) {
      e = 0;
      for (var f = b.length;e < f;e++) {
        var g = b[e];
        c[g.id] = g;
        a.push.call(this, g);
      }
    }
  };
  b.push = function(b) {
    this._hashMap[b.id] = b;
    a.push.call(this, b);
  };
  b.unshift = function() {
    for (var b = Array.prototype.slice.call(arguments, 0), c = this._hashMap, e = b.length - 1;0 <= e;e--) {
      var f = b[e];
      a.unshift.call(this, f);
      c[f.id] = f;
    }
  };
  b.insert = function(b, c) {
    a.splice.call(this, c, 0, b);
    this._hashMap[b.id] = b;
  };
  b.has = function(a) {
    return !!this._hashMap[a];
  };
  b.get = function(a) {
    return this._hashMap[a];
  };
  b.at = function(a) {
    return this[a];
  };
  b.getAll = function() {
    for (var a = this.length, b = [], e = 0;e < a;e++) {
      b.push(this[e]);
    }
    return b;
  };
  b.indexOf = function(b) {
    return a.indexOf.call(this, b);
  };
  b.find = function(a) {
    for (var b = [], e, f = 0, g = this.length;f < g;f++) {
      e = !0;
      var h = this[f], k;
      for (k in a) {
        if (a[k] != h[k]) {
          e = !1;
          break;
        }
      }
      e && b.push(h);
    }
    return b;
  };
  b.pop = function() {
    var b = a.pop.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.shift = function() {
    var b = a.shift.call(this);
    delete this._hashMap[b.id];
    return b;
  };
  b.slice = function(b, c) {
    var e = a.slice.call(this, b, c), f = this._hashMap, g;
    for (g in e) {
      delete f[e[g].id];
    }
    return e;
  };
  b.remove = function(a) {
    var b = this.indexOf(a);
    -1 < b && (delete this._hashMap[a.id], this.splice(b, 1));
  };
  b.splice = function(b, c) {
    var e = a.slice.call(arguments, 2), f = this._hashMap;
    c = void 0 === c ? this.length - b : c;
    for (var g = a.splice.call(this, b, c), h = 0, k = g.length;h < k;h++) {
      delete f[g[h].id];
    }
    h = 0;
    for (k = e.length;h < k;h++) {
      f = e[h], a.splice.call(this, b++, 0, f), this._hashMap[f.id] = f;
    }
    return g;
  };
  b.clear = function() {
    for (;this.length;) {
      a.pop.call(this);
    }
    this._hashMap = {};
  };
  b.map = function(a, b) {
    for (var e = [], f = 0, g = this.length;f < g;f++) {
      e.push(a(this[f], b));
    }
    return e;
  };
  b.moveFromTo = function(b, c) {
    var e = this.length - 1;
    0 > b || 0 > c || b > e || c > e || a.splice.call(this, c, 0, a.splice.call(this, b, 1)[0]);
  };
  b.sort = function() {
  };
  b.fromJSON = function() {
  };
  b.toJSON = function() {
    for (var a = [], b = 0, e = this.length;b < e;b++) {
      a.push(this[b].toJSON());
    }
    return a;
  };
  b.observe = function() {
  };
  b.unobserve = function() {
  };
  b.notify = function() {
  };
  b.destroy = function() {
  };
})(Entry.Collection.prototype, Array.prototype);
Entry.Event = function(b) {
  this._sender = b;
  this._listeners = [];
};
(function(b) {
  b.attach = function(a, b) {
    var c = this, e = {obj:a, fn:b, destroy:function() {
      c.detach(this);
    }};
    this._listeners.push(e);
    return e;
  };
  b.detach = function(a) {
    var b = this._listeners;
    a = b.indexOf(a);
    if (-1 < a) {
      return b.splice(a, 1);
    }
  };
  b.clear = function() {
    for (var a = this._listeners;a.length;) {
      a.pop();
    }
  };
  b.notify = function() {
    var a = arguments;
    this._listeners.slice().forEach(function(b) {
      b.fn.apply(b.obj, a);
    });
  };
})(Entry.Event.prototype);
Entry.Observer = function(b, a, d, c) {
  this.parent = b;
  this.object = a;
  this.funcName = d;
  this.attrs = c;
  b.push(this);
};
(function(b) {
  b.destroy = function() {
    var a = this.parent, b = a.indexOf(this);
    -1 < b && a.splice(b, 1);
    return this;
  };
})(Entry.Observer.prototype);
Entry.Command = {};
Entry.Commander = function(b) {
  if ("workspace" == b || "phone" == b) {
    Entry.stateManager = new Entry.StateManager;
  }
  Entry.do = this.do.bind(this);
  Entry.undo = this.undo.bind(this);
  this.editor = {};
  Entry.Command.editor = this.editor;
};
(function(b) {
  b.do = function(a) {
    var b = Array.prototype.slice.call(arguments);
    b.shift();
    var c = Entry.Command[a];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [a, this, this.do, c.undo].concat(c.state.apply(this, b)));
    return {value:Entry.Command[a].do.apply(this, b), isPass:this.isPass.bind(this)};
  };
  b.undo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), c = Entry.Command[b];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.do, c.undo].concat(c.state.apply(this, a)));
    return {value:Entry.Command[b].do.apply(this, a), isPass:this.isPass.bind(this)};
  };
  b.redo = function() {
    var a = Array.prototype.slice.call(arguments), b = a.shift(), c = Entry.Command[b];
    Entry.stateManager && Entry.stateManager.addCommand.apply(Entry.stateManager, [b, this, this.undo, b].concat(c.state.apply(null, a)));
    c.undo.apply(this, a);
  };
  b.setCurrentEditor = function(a, b) {
    this.editor[a] = b;
  };
  b.isPass = function(a) {
    a = void 0 === a ? !0 : a;
    if (Entry.stateManager) {
      var b = Entry.stateManager.getLastCommand();
      b && (b.isPass = a);
    }
  };
})(Entry.Commander.prototype);
(function(b) {
  b.addThread = {type:101, do:function(a) {
    return this.editor.board.code.createThread(a);
  }, state:function(a) {
    0 < a.length && (a[0].id = Entry.Utils.generateId());
    return [a];
  }, log:function(a) {
    return [a.id, a.toJSON()];
  }, undo:"destroyThread"};
  b.destroyThread = {type:106, do:function(a) {
    this.editor.board.findById(a[0].id).destroy(!0, !0);
  }, state:function(a) {
    return [this.editor.board.findById(a[0].id).thread.toJSON()];
  }, log:function(a) {
  }, undo:"addThread"};
  b.destroyBlock = {type:106, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    a.doDestroy(!0);
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.toJSON(), a.pointer()];
  }, log:function(a) {
  }, undo:"recoverBlock"};
  b.recoverBlock = {type:106, do:function(a, b) {
    var c = this.editor.board.code.createThread([a]).getFirstBlock();
    "string" === typeof c && (c = this.editor.board.findById(c));
    this.editor.board.insert(c, b);
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a) {
  }, undo:"destroyBlock"};
  b.insertBlock = {type:102, do:function(a, b, c) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.insert(a, b, c);
  }, state:function(a, b) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    var c = [a.id], e = a.targetPointer();
    c.push(e);
    "string" !== typeof a && "basic" === a.getBlockType() && c.push(a.thread.getCount(a));
    return c;
  }, log:function(a) {
  }, undo:"insertBlock"};
  b.separateBlock = {type:103, do:function(a) {
    a.view && a.view._toGlobalCoordinate(Entry.DRAG_MODE_DRAG);
    a.doSeparate();
  }, state:function(a) {
    var b = [a.id], c = a.targetPointer();
    b.push(c);
    "basic" === a.getBlockType() && b.push(a.thread.getCount(a));
    return b;
  }, log:function(a) {
  }, undo:"insertBlock"};
  b.moveBlock = {type:104, do:function(a, b, c) {
    void 0 !== b ? (a = this.editor.board.findById(a), a.moveTo(b, c)) : a._updatePos();
  }, state:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    return [a.id, a.x, a.y];
  }, log:function(a) {
    return [a.id, a.toJSON()];
  }, undo:"moveBlock"};
  b.cloneBlock = {type:105, do:function(a) {
    "string" === typeof a && (a = this.editor.board.findById(a));
    this.editor.board.code.createThread(a.copy());
  }, state:function(a) {
    "string" !== typeof a && (a = a.id);
    return [a];
  }, log:function(a) {
    return [a.id, a.toJSON()];
  }, undo:"uncloneBlock"};
  b.uncloneBlock = {type:105, do:function(a) {
    this.editor.board.code.getThreads().pop().getFirstBlock().destroy(!0, !0);
  }, state:function(a) {
    return [a];
  }, log:function(a) {
    return [a.id, a.toJSON()];
  }, undo:"cloneBlock"};
  b.scrollBoard = {type:105, do:function(a, b) {
    this.editor.board.scroller._scroll(a, b);
  }, state:function(a, b) {
    return [-a, -b];
  }, log:function(a) {
    return [a.id, a.toJSON()];
  }, undo:"scrollBoard"};
  b.setFieldValue = {type:106, do:function(a, b, c, e, f) {
    b.setValue(f, !0);
  }, state:function(a, b, c, e, f) {
    return [a, b, c, f, e];
  }, log:function(a, b) {
    return [a.id, b];
  }, undo:"setFieldValue"};
})(Entry.Command);
(function(b) {
  b.selectObject = {type:201, do:function(a) {
    return Entry.container.selectObject(a);
  }, state:function(a) {
    if ((a = Entry.playground) && a.object) {
      return [a.object.id];
    }
  }, log:function(a) {
    return [a];
  }, undo:"selectObject"};
})(Entry.Command);
Entry.Container = function() {
  this.objects_ = [];
  this.cachedPicture = {};
  this.inputValue = {};
  this.currentObjects_ = this.copiedObject = null;
};
Entry.Container.prototype.generateView = function(b, a) {
  this._view = b;
  this._view.addClass("entryContainer");
  if (a && "workspace" != a) {
    "phone" == a && (this._view.addClass("entryContainerPhone"), d = Entry.createElement("div"), d.addClass("entryAddObjectWorkspace"), d.innerHTML = Lang.Workspace.add_object, d.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    }), d = Entry.createElement("div"), d.addClass("entryContainerListPhoneWrapper"), this._view.appendChild(d), c = Entry.createElement("ul"), c.addClass("entryContainerListPhone"), d.appendChild(c), this.listView_ = c);
  } else {
    this._view.addClass("entryContainerWorkspace");
    this._view.setAttribute("id", "entryContainerWorkspaceId");
    var d = Entry.createElement("div");
    d.addClass("entryAddObjectWorkspace");
    d.innerHTML = Lang.Workspace.add_object;
    d.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    });
    d = Entry.createElement("div");
    d.addClass("entryContainerListWorkspaceWrapper");
    Entry.isForLecture && (this.generateTabView(), d.addClass("lecture"));
    Entry.Utils.disableContextmenu(d);
    $(d).on("contextmenu", function(a) {
      Entry.ContextMenu.show([{text:Lang.Blocks.Paste_blocks, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}], "workspace-contextmenu");
    });
    this._view.appendChild(d);
    var c = Entry.createElement("ul");
    c.addClass("entryContainerListWorkspace");
    d.appendChild(c);
    this.listView_ = c;
    this.enableSort();
  }
};
Entry.Container.prototype.enableSort = function() {
  $ && $(this.listView_).sortable({start:function(b, a) {
    a.item.data("start_pos", a.item.index());
  }, stop:function(b, a) {
    var d = a.item.data("start_pos"), c = a.item.index();
    Entry.container.moveElement(d, c);
  }, axis:"y"});
};
Entry.Container.prototype.disableSort = function() {
  $ && $(this.listView_).sortable("destroy");
};
Entry.Container.prototype.updateListView = function() {
  if (this.listView_) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    var a = this.getCurrentObjects(), d;
    for (d in a) {
      b.appendChild(a[d].view_);
    }
    Entry.stage.sortZorder();
  }
};
Entry.Container.prototype.setObjects = function(b) {
  for (var a in b) {
    var d = new Entry.EntryObject(b[a]);
    this.objects_.push(d);
    d.generateView();
    d.pictures.map(function(a) {
      Entry.playground.generatePictureElement(a);
    });
    d.sounds.map(function(a) {
      Entry.playground.generateSoundElement(a);
    });
  }
  this.updateObjectsOrder();
  this.updateListView();
  Entry.stage.sortZorder();
  Entry.variableContainer.updateViews();
  b = Entry.type;
  ("workspace" == b || "phone" == b) && (b = this.getCurrentObjects()[0]) && this.selectObject(b.id);
};
Entry.Container.prototype.getPictureElement = function(b) {
  for (var a in this.objects_) {
    var d = this.objects_[a], c;
    for (c in d.pictures) {
      if (b === d.pictures[c].id) {
        return d.pictures[c].view;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.setPicture = function(b) {
  for (var a in this.objects_) {
    var d = this.objects_[a], c;
    for (c in d.pictures) {
      if (b.id === d.pictures[c].id) {
        a = {};
        a.dimension = b.dimension;
        a.id = b.id;
        a.filename = b.filename;
        a.fileurl = b.fileurl;
        a.name = b.name;
        a.view = d.pictures[c].view;
        d.pictures[c] = a;
        return;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.selectPicture = function(b) {
  for (var a in this.objects_) {
    var d = this.objects_[a], c;
    for (c in d.pictures) {
      var e = d.pictures[c];
      if (b === e.id) {
        return d.selectedPicture = e, d.entity.setImage(e), d.updateThumbnailView(), d.id;
      }
    }
  }
  throw Error("No picture found");
};
Entry.Container.prototype.addObject = function(b, a) {
  var d = new Entry.EntryObject(b);
  d.name = Entry.getOrderedName(d.name, this.objects_);
  Entry.stateManager && Entry.stateManager.addCommand("add object", this, this.removeObject, d);
  d.scene || (d.scene = Entry.scene.selectedScene);
  "number" == typeof a ? b.sprite.category && "background" == b.sprite.category.main ? (d.setLock(!0), this.objects_.push(d)) : this.objects_.splice(a, 0, d) : b.sprite.category && "background" == b.sprite.category.main ? this.objects_.push(d) : this.objects_.unshift(d);
  d.generateView();
  d.pictures.map(function(a) {
    a.id = Entry.generateHash();
    Entry.playground.generatePictureElement(a);
  });
  d.sounds.map(function(a) {
    Entry.playground.generateSoundElement(a);
  });
  this.setCurrentObjects();
  this.updateObjectsOrder();
  this.updateListView();
  this.selectObject(d.id);
  Entry.variableContainer.updateViews();
  return new Entry.State(this, this.removeObject, d);
};
Entry.Container.prototype.addCloneObject = function(b, a) {
  var d = b.toJSON(), c = Entry.generateHash();
  Entry.variableContainer.addCloneLocalVariables({objectId:d.id, newObjectId:c, json:d});
  d.id = c;
  d.scene = a || Entry.scene.selectedScene;
  this.addObject(d);
};
Entry.Container.prototype.removeObject = function(b) {
  var a = this.objects_.indexOf(b), d = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove object", this, this.addObject, d, a);
  d = new Entry.State(this.addObject, d, a);
  b.destroy();
  this.objects_.splice(a, 1);
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.objects_.length && 0 !== a ? 0 < this.getCurrentObjects().length ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : Entry.container.selectObject() : this.objects_.length && 0 === a ? Entry.container.selectObject(this.getCurrentObjects()[0].id) : (Entry.container.selectObject(), Entry.playground.flushPlayground());
  Entry.toast.success(Lang.Workspace.remove_object, b.name + " " + Lang.Workspace.remove_object_msg);
  Entry.variableContainer.removeLocalVariables(b.id);
  Entry.playground.reloadPlayground();
  return d;
};
Entry.Container.prototype.selectObject = function(b, a) {
  var d = this.getObject(b);
  a && d && Entry.scene.selectScene(d.scene);
  this.mapObjectOnScene(function(a) {
    a.view_ && a.view_.removeClass("selectedObject");
    a.isSelected_ = !1;
  });
  d && (d.view_ && d.view_.addClass("selectedObject"), d.isSelected_ = !0);
  Entry.playground && Entry.playground.injectObject(d);
  "minimize" != Entry.type && Entry.engine.isState("stop") && Entry.stage.selectObject(d);
};
Entry.Container.prototype.getAllObjects = function() {
  return this.objects_;
};
Entry.Container.prototype.getObject = function(b) {
  for (var a = this.objects_.length, d = 0;d < a;d++) {
    var c = this.objects_[d];
    if (c.id == b) {
      return c;
    }
  }
};
Entry.Container.prototype.getEntity = function(b) {
  if (b = this.getObject(b)) {
    return b.entity;
  }
  Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.object_not_found, !0);
};
Entry.Container.prototype.getVariable = function(b) {
  for (var a = 0;a < this.variables_.length;a++) {
    var d = this.variables_[a];
    if (d.getId() == b || d.getName() == b) {
      return d;
    }
  }
};
Entry.Container.prototype.moveElement = function(b, a, d) {
  var c;
  c = this.getCurrentObjects();
  b = this.getAllObjects().indexOf(c[b]);
  a = this.getAllObjects().indexOf(c[a]);
  !d && Entry.stateManager && Entry.stateManager.addCommand("reorder object", Entry.container, Entry.container.moveElement, a, b, !0);
  this.objects_.splice(a, 0, this.objects_.splice(b, 1)[0]);
  this.setCurrentObjects();
  Entry.container.updateListView();
  return new Entry.State(Entry.container, Entry.container.moveElement, a, b, !0);
};
Entry.Container.prototype.moveElementByBlock = function(b, a) {
  var d = this.getCurrentObjects().splice(b, 1)[0];
  this.getCurrentObjects().splice(a, 0, d);
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getDropdownList = function(b) {
  var a = [];
  switch(b) {
    case "sprites":
      var d = this.getCurrentObjects(), c = d.length;
      for (b = 0;b < c;b++) {
        var e = d[b];
        a.push([e.name, e.id]);
      }
      break;
    case "spritesWithMouse":
      d = this.getCurrentObjects();
      c = d.length;
      for (b = 0;b < c;b++) {
        e = d[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.mouse_pointer, "mouse"]);
      break;
    case "spritesWithSelf":
      d = this.getCurrentObjects();
      c = d.length;
      for (b = 0;b < c;b++) {
        e = d[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.self, "self"]);
      break;
    case "collision":
      a.push([Lang.Blocks.mouse_pointer, "mouse"]);
      d = this.getCurrentObjects();
      c = d.length;
      for (b = 0;b < c;b++) {
        e = d[b], a.push([e.name, e.id]);
      }
      a.push([Lang.Blocks.wall, "wall"]);
      a.push([Lang.Blocks.wall_up, "wall_up"]);
      a.push([Lang.Blocks.wall_down, "wall_down"]);
      a.push([Lang.Blocks.wall_right, "wall_right"]);
      a.push([Lang.Blocks.wall_left, "wall_left"]);
      break;
    case "pictures":
      if (!Entry.playground.object) {
        break;
      }
      d = Entry.playground.object.pictures;
      for (b = 0;b < d.length;b++) {
        c = d[b], a.push([c.name, c.id]);
      }
      break;
    case "messages":
      d = Entry.variableContainer.messages_;
      for (b = 0;b < d.length;b++) {
        c = d[b], a.push([c.name, c.id]);
      }
      break;
    case "variables":
      d = Entry.variableContainer.variables_;
      for (b = 0;b < d.length;b++) {
        c = d[b], c.object_ && c.object_ != Entry.playground.object.id || a.push([c.getName(), c.getId()]);
      }
      a && 0 !== a.length || a.push([Lang.Blocks.VARIABLE_variable, "null"]);
      break;
    case "lists":
      d = Entry.variableContainer.lists_;
      for (b = 0;b < d.length;b++) {
        c = d[b], a.push([c.getName(), c.getId()]);
      }
      a && 0 !== a.length || a.push([Lang.Blocks.VARIABLE_list, "null"]);
      break;
    case "scenes":
      d = Entry.scene.scenes_;
      for (b = 0;b < d.length;b++) {
        c = d[b], a.push([c.name, c.id]);
      }
      break;
    case "sounds":
      if (!Entry.playground.object) {
        break;
      }
      d = Entry.playground.object.sounds;
      for (b = 0;b < d.length;b++) {
        c = d[b], a.push([c.name, c.id]);
      }
      break;
    case "clone":
      a.push([Lang.Blocks.oneself, "self"]);
      c = this.objects_.length;
      for (b = 0;b < c;b++) {
        e = this.objects_[b], a.push([e.name, e.id]);
      }
      break;
    case "objectSequence":
      for (c = this.getCurrentObjects().length, b = 0;b < c;b++) {
        a.push([(b + 1).toString(), b.toString()]);
      }
    ;
  }
  a.length || (a = [[Lang.Blocks.no_target, "null"]]);
  return a;
};
Entry.Container.prototype.clearRunningState = function() {
  this.mapObject(function(b) {
    b.clearExecutor();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapObject = function(b, a) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(b(this.objects_[e], a));
  }
  return c;
};
Entry.Container.prototype.mapObjectOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    e.push(b(d[f], a));
  }
  return e;
};
Entry.Container.prototype.clearRunningStateOnScene = function() {
  this.mapObjectOnScene(function(b) {
    b.clearExecutor();
    for (var a = b.clonedEntities.length;0 < a;a--) {
      b.clonedEntities[a - 1].removeClone();
    }
    b.clonedEntities = [];
  });
};
Entry.Container.prototype.mapEntity = function(b, a) {
  for (var d = this.objects_.length, c = [], e = 0;e < d;e++) {
    c.push(b(this.objects_[e].entity, a));
  }
  return c;
};
Entry.Container.prototype.mapEntityOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    e.push(b(d[f].entity, a));
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeClone = function(b, a) {
  for (var d = this.objects_, c = d.length, e = [], f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.mapEntityIncludeCloneOnScene = function(b, a) {
  for (var d = this.getCurrentObjects(), c = d.length, e = [], f = 0;f < c;f++) {
    var g = d[f], h = g.clonedEntities.length;
    e.push(b(g.entity, a));
    for (var k = 0;k < h;k++) {
      var l = g.clonedEntities[k];
      l && !l.isStamp && e.push(b(l, a));
    }
  }
  return e;
};
Entry.Container.prototype.getCachedPicture = function(b) {
  Entry.assert("string" == typeof b, "pictureId must be string");
  return this.cachedPicture[b];
};
Entry.Container.prototype.cachePicture = function(b, a) {
  this.cachedPicture[b] = a;
};
Entry.Container.prototype.toJSON = function() {
  for (var b = [], a = this.objects_.length, d = 0;d < a;d++) {
    b.push(this.objects_[d].toJSON());
  }
  return b;
};
Entry.Container.prototype.takeSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = this.objects_, d = 0;d < b;d++) {
    a[d].index = d;
  }
};
Entry.Container.prototype.loadSequenceSnapshot = function() {
  for (var b = this.objects_.length, a = Array(b), d = 0;d < b;d++) {
    var c = this.objects_[d];
    a[c.index] = c;
    delete c.index;
  }
  this.objects_ = a;
  this.setCurrentObjects();
  Entry.stage.sortZorder();
  this.updateListView();
};
Entry.Container.prototype.getInputValue = function() {
  return this.inputValue.getValue();
};
Entry.Container.prototype.setInputValue = function(b) {
  b ? this.inputValue.setValue(b) : this.inputValue.setValue(0);
};
Entry.Container.prototype.resetSceneDuringRun = function() {
  this.mapEntityOnScene(function(b) {
    b.loadSnapshot();
    b.object.filters = [];
    b.resetFilter();
    b.dialog && b.dialog.remove();
    b.shape && b.removeBrush();
  });
  this.clearRunningStateOnScene();
};
Entry.Container.prototype.setCopiedObject = function(b) {
  this.copiedObject = b;
};
Entry.Container.prototype.updateObjectsOrder = function() {
  for (var b = Entry.scene.getScenes(), a = [], d = 0;d < b.length;d++) {
    for (var c = this.getSceneObjects(b[d]), e = 0;e < c.length;e++) {
      a.push(c[e]);
    }
  }
  this.objects_ = a;
};
Entry.Container.prototype.getSceneObjects = function(b) {
  b = b || Entry.scene.selectedScene;
  for (var a = [], d = this.getAllObjects(), c = 0;c < d.length;c++) {
    b.id == d[c].scene.id && a.push(d[c]);
  }
  return a;
};
Entry.Container.prototype.setCurrentObjects = function() {
  this.currentObjects_ = this.getSceneObjects();
};
Entry.Container.prototype.getCurrentObjects = function() {
  var b = this.currentObjects_;
  b && 0 !== b.length || this.setCurrentObjects();
  return this.currentObjects_;
};
Entry.Container.prototype.getProjectWithJSON = function(b) {
  b.objects = Entry.container.toJSON();
  b.variables = Entry.variableContainer.getVariableJSON();
  b.messages = Entry.variableContainer.getMessageJSON();
  b.scenes = Entry.scene.toJSON();
  return b;
};
Entry.Container.prototype.generateTabView = function() {
  var b = this._view, a = this;
  this.tabViews = [];
  var d = Entry.createElement("div");
  d.addClass("entryContainerTabViewWorkspace");
  b.appendChild(d);
  var c = Entry.createElement("span");
  c.addClass("entryContainerTabItemWorkspace");
  c.addClass("entryEllipsis");
  c.innerHTML = Lang.Menus.lecture_container_tab_object;
  c.bindOnClick(function() {
    a.changeTabView("object");
  });
  this.tabViews.push(c);
  d.appendChild(c);
  var e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_video;
  e.bindOnClick(function() {
    a.changeTabView("movie");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  this.youtubeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace", "entryRemove");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_project;
  e.bindOnClick(function() {
    a.changeTabView("done");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  this.iframeTab = e;
  e = Entry.createElement("span");
  e.addClass("entryContainerTabItemWorkspace");
  e.addClass("entryEllipsis");
  e.innerHTML = Lang.Menus.lecture_container_tab_help;
  e.bindOnClick(function() {
    a.changeTabView("helper");
  });
  this.tabViews.push(e);
  d.appendChild(e);
  d = Entry.createElement("div");
  d.addClass("entryContainerMovieWorkspace");
  d.addClass("entryHide");
  b.appendChild(d);
  this.movieContainer = d;
  d = Entry.createElement("div");
  d.addClass("entryContainerDoneWorkspace");
  d.addClass("entryHide");
  b.appendChild(d);
  this.doneContainer = d;
  d = Entry.createElement("div");
  d.addClass("entryContainerHelperWorkspace");
  d.addClass("entryHide");
  b.appendChild(d);
  this.helperContainer = d;
  c.addClass("selected");
};
Entry.Container.prototype.changeTabView = function(b) {
  for (var a = this.tabViews, d = 0, c = a.length;d < c;d++) {
    a[d].removeClass("selected");
  }
  this.movieContainer.addClass("entryHide");
  this.doneContainer.addClass("entryHide");
  this.helperContainer.addClass("entryHide");
  "object" == b ? a[0].addClass("selected") : "movie" == b ? (b = this._view, b = b.style.width.substring(0, b.style.width.length - 2), this.movieFrame.setAttribute("width", b), this.movieFrame.setAttribute("height", 9 * b / 16), this.movieContainer.removeClass("entryHide"), a[1].addClass("selected")) : "done" == b ? (d = $(this.doneContainer).height(), b = $(this.doneContainer).width(), 9 * b / 16 + 35 < d ? d = 9 * b / 16 + 35 : b = (d - 35) / 9 * 16, this.doneProjectFrame.setAttribute("width", 
  b), this.doneProjectFrame.setAttribute("height", d), this.doneContainer.removeClass("entryHide"), a[2].addClass("selected")) : "helper" == b && (Entry.helper.blockHelperOn(), this.helperContainer.removeClass("entryHide"), a[3].addClass("selected"));
};
Entry.Container.prototype.initYoutube = function(b) {
  this.youtubeHash = b;
  this.youtubeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = this.movieContainer, d = Entry.createElement("iframe");
  d.setAttribute("width", b);
  d.setAttribute("height", 9 * b / 16);
  d.setAttribute("allowfullscreen", "");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "https://www.youtube.com/embed/" + this.youtubeHash);
  this.movieFrame = d;
  a.appendChild(d);
};
Entry.Container.prototype.initTvcast = function(b) {
  this.tvcast = b;
  this.youtubeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = this.movieContainer, d = Entry.createElement("iframe");
  d.setAttribute("width", b);
  d.setAttribute("height", 9 * b / 16);
  d.setAttribute("allowfullscreen", "");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", this.tvcast);
  this.movieFrame = d;
  a.appendChild(d);
};
Entry.Container.prototype.initDoneProject = function(b) {
  this.doneProject = b;
  this.iframeTab.removeClass("entryRemove");
  b = this._view;
  b = b.style.width.substring(0, b.style.width.length - 2);
  var a = Entry.createElement("iframe");
  a.setAttribute("width", b);
  a.setAttribute("height", 9 * b / 16 + 35);
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "/api/iframe/project/" + this.doneProject);
  this.doneProjectFrame = a;
  this.doneContainer.appendChild(a);
};
Entry.Container.prototype.blurAllInputs = function() {
  this.getSceneObjects().map(function(b) {
    b = b.view_.getElementsByTagName("input");
    for (var a = 0, d = b.length;a < d;a++) {
      b[a].blur();
    }
  });
};
Entry.Container.prototype.showProjectAnswer = function() {
  var b = this.inputValue;
  b && b.setVisible(!0);
};
Entry.Container.prototype.hideProjectAnswer = function(b) {
  if ((b = this.inputValue) && b.isVisible() && !Entry.engine.isState("run")) {
    for (var a = Entry.container.getAllObjects(), d = ["ask_and_wait", "get_canvas_input_value", "set_visible_answer"], c = 0, e = a.length;c < e;c++) {
      for (var f = a[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Container.prototype.getView = function() {
  return this._view;
};
Entry.Container.prototype.resize = function() {
};
Entry.db = {data:{}, typeMap:{}};
(function(b) {
  b.add = function(a) {
    this.data[a.id] = a;
    var b = a.type;
    void 0 === this.typeMap[b] && (this.typeMap[b] = {});
    this.typeMap[b][a.id] = a;
  };
  b.has = function(a) {
    return this.data.hasOwnProperty(a);
  };
  b.remove = function(a) {
    this.has(a) && (delete this.typeMap[this.data[a].type][a], delete this.data[a]);
  };
  b.get = function(a) {
    return this.data[a];
  };
  b.find = function() {
  };
  b.clear = function() {
    this.data = {};
    this.typeMap = {};
  };
})(Entry.db);
Entry.Dom = function(b, a) {
  var d = /<(\w+)>/, c;
  c = b instanceof HTMLElement ? $(b) : b instanceof jQuery ? b : d.test(b) ? $(b) : $("<" + b + "></" + b + ">");
  if (void 0 === a) {
    return c;
  }
  a.id && c.attr("id", a.id);
  a.class && c.addClass(a.class);
  a.classes && a.classes.map(function(a) {
    c.addClass(a);
  });
  a.src && c.attr("src", a.src);
  a.parent && a.parent.append(c);
  c.bindOnClick = function() {
    var a, b, d = function(a) {
      a.stopImmediatePropagation();
      a.handled || (a.handled = !0, b.call(this, a));
    };
    1 < arguments.length ? (b = arguments[1] instanceof Function ? arguments[1] : function() {
    }, a = "string" === typeof arguments[0] ? arguments[0] : "") : b = arguments[0] instanceof Function ? arguments[0] : function() {
    };
    if (a) {
      $(this).on("click tab", a, d);
    } else {
      $(this).on("click tab", d);
    }
  };
  return c;
};
Entry.SVG = function(b) {
  b = document.getElementById(b);
  return Entry.SVG.createElement(b);
};
Entry.SVG.NS = "http://www.w3.org/2000/svg";
Entry.SVG.NS_XLINK = "http://www.w3.org/1999/xlink";
Entry.SVG.createElement = function(b, a) {
  var d;
  d = "string" === typeof b ? document.createElementNS(Entry.SVG.NS, b) : b;
  if (a) {
    a.href && (d.setAttributeNS(Entry.SVG.NS_XLINK, "href", a.href), delete a.href);
    for (var c in a) {
      d.setAttribute(c, a[c]);
    }
  }
  this instanceof SVGElement && this.appendChild(d);
  d.elem = Entry.SVG.createElement;
  d.attr = Entry.SVG.attr;
  d.addClass = Entry.SVG.addClass;
  d.removeClass = Entry.SVG.removeClass;
  d.hasClass = Entry.SVG.hasClass;
  d.remove = Entry.SVG.remove;
  d.removeAttr = Entry.SVG.removeAttr;
  return d;
};
Entry.SVG.attr = function(b, a) {
  if ("string" === typeof b) {
    var d = {};
    d[b] = a;
    b = d;
  }
  if (b) {
    b.href && (this.setAttributeNS(Entry.SVG.NS_XLINK, "href", b.href), delete b.href);
    for (var c in b) {
      this.setAttribute(c, b[c]);
    }
  }
  return this;
};
Entry.SVG.addClass = function(b) {
  for (var a = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    b = arguments[d], this.hasClass(b) || (a += " " + b);
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.removeClass = function(b) {
  for (var a = this.getAttribute("class"), d = 0;d < arguments.length;d++) {
    b = arguments[d], this.hasClass(b) && (a = a.replace(new RegExp("(\\s|^)" + b + "(\\s|$)"), " "));
  }
  this.setAttribute("class", a);
  return this;
};
Entry.SVG.hasClass = function(b) {
  var a = this.getAttribute("class");
  return a ? a.match(new RegExp("(\\s|^)" + b + "(\\s|$)")) : !1;
};
Entry.SVG.remove = function() {
  this.parentNode && this.parentNode.removeChild(this);
};
Entry.SVG.removeAttr = function(b) {
  this.removeAttribute(b);
};
Entry.Dialog = function(b, a, d, c) {
  b.dialog && b.dialog.remove();
  b.dialog = this;
  this.parent = b;
  this.padding = 10;
  this.border = 2;
  "number" == typeof a && (a = String(a));
  this.message_ = a = a.match(/.{1,15}/g).join("\n");
  this.mode_ = d;
  "speak" == d && this.generateSpeak();
  c || Entry.stage.loadDialog(this);
};
Entry.Dialog.prototype.generateSpeak = function() {
  this.object = new createjs.Container;
  var b = new createjs.Text;
  b.font = "15px NanumGothic";
  b.textBaseline = "top";
  b.textAlign = "left";
  b.text = this.message_;
  var a = b.getTransformedBounds(), d = a.height, a = 10 <= a.width ? a.width : 17, c = new createjs.Shape;
  c.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").rr(-this.padding, -this.padding, a + 2 * this.padding, d + 2 * this.padding, this.padding);
  this.object.addChild(c);
  this.object.regX = a / 2;
  this.object.regY = d / 2;
  this.width = a;
  this.height = d;
  this.notch = this.createSpeakNotch("ne");
  this.update();
  this.object.addChild(this.notch);
  this.object.addChild(b);
};
Entry.Dialog.prototype.update = function() {
  var b = this.parent.object.getTransformedBounds(), a = "";
  -135 < b.y - this.height - 20 - this.border ? (this.object.y = b.y - this.height / 2 - 20 - this.padding, a += "n") : (this.object.y = b.y + b.height + this.height / 2 + 20 + this.padding, a += "s");
  240 > b.x + b.width + this.width ? (this.object.x = b.x + b.width + this.width / 2, a += "e") : (this.object.x = b.x - this.width / 2, a += "w");
  this.notch.type != a && (this.object.removeChild(this.notch), this.notch = this.createSpeakNotch(a), this.object.addChild(this.notch));
};
Entry.Dialog.prototype.createSpeakNotch = function(b) {
  var a = new createjs.Shape;
  a.type = b;
  "ne" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, this.height + this.padding - 1.5).lt(-10, this.height + this.padding + 20).lt(20, this.height + this.padding - 1.5) : "nw" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, this.height + this.padding - 1.5).lt(this.width + 10, this.height + this.padding + 20).lt(this.width - 20, this.height + this.padding - 1.5) : "se" == b ? a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(0, -this.padding + 1.5).lt(-10, 
  -this.padding - 20).lt(20, -this.padding + 1.5) : "sw" == b && a.graphics.f("#f5f5f5").ss(2, "round").s("#6FC0DD").mt(this.width, -this.padding + 1.5).lt(this.width + 10, -this.padding - 20).lt(this.width - 20, -this.padding + 1.5);
  return a;
};
Entry.Dialog.prototype.remove = function() {
  Entry.stage.unloadDialog(this);
  this.parent.dialog = null;
};
Entry.DoneProject = function(b) {
  this.generateView(b);
};
var p = Entry.DoneProject.prototype;
p.init = function(b) {
  this.projectId = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerDoneWorkspace");
  this.doneContainer = a;
  var d = Entry.createElement("iframe");
  d.setAttribute("id", "doneProjectframe");
  d.setAttribute("frameborder", 0);
  d.setAttribute("src", "/api/iframe/project/" + b);
  this.doneProjectFrame = d;
  this.doneContainer.appendChild(d);
  a.addClass("entryRemove");
};
p.getView = function() {
  return this.doneContainer;
};
p.resize = function() {
  document.getElementById("entryContainerWorkspaceId");
  var b = document.getElementById("doneProjectframe"), a = this.doneContainer.offsetWidth;
  b.width = a + "px";
  b.height = 9 * a / 16 + "px";
};
Entry.Engine = function() {
  function b(a) {
    var b = [37, 38, 39, 40, 32], c = a.keyCode || a.which, e = Entry.stage.inputField;
    32 == c && e && e.hasFocus() || -1 < b.indexOf(c) && a.preventDefault();
  }
  this.state = "stop";
  this.popup = null;
  this.isUpdating = !0;
  this.speeds = [1, 15, 30, 45, 60];
  Entry.keyPressed && Entry.keyPressed.attach(this, this.captureKeyEvent);
  Entry.addEventListener("canvasClick", function(a) {
    Entry.engine.fireEvent("mouse_clicked");
  });
  Entry.addEventListener("canvasClickCanceled", function(a) {
    Entry.engine.fireEvent("mouse_click_cancled");
  });
  Entry.addEventListener("entityClick", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click", a);
  });
  Entry.addEventListener("entityClickCanceled", function(a) {
    Entry.engine.fireEventOnEntity("when_object_click_canceled", a);
  });
  "phone" != Entry.type && (Entry.addEventListener("stageMouseMove", function(a) {
    Entry.engine.updateMouseView();
  }), Entry.addEventListener("stageMouseOut", function(a) {
    Entry.engine.hideMouseView();
  }));
  Entry.addEventListener("run", function() {
    $(window).bind("keydown", b);
  });
  Entry.addEventListener("stop", function() {
    $(window).unbind("keydown", b);
  });
};
Entry.Engine.prototype.generateView = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (this.view_ = b, this.view_.addClass("entryEngine"), this.view_.addClass("entryEngineMinimize"), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonMinimize"), this.maximizeButton.addClass("entryMaximizeButtonMinimize"), this.view_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    }), this.coordinateButton = Entry.createElement("button"), this.coordinateButton.addClass("entryEngineButtonMinimize"), this.coordinateButton.addClass("entryCoordinateButtonMinimize"), this.view_.appendChild(this.coordinateButton), this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      Entry.stage.toggleCoordinator();
    }), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonMinimize"), this.runButton.addClass("entryRunButtonMinimize"), this.runButton.innerHTML = Lang.Blocks.START, this.view_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    }), this.runButton2 = Entry.createElement("button"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup"), this.runButton2.addClass("entryEngineBigButtonMinimize_popup_run"), this.view_.appendChild(this.runButton2), this.runButton2.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonMinimize"), this.stopButton.addClass("entryStopButtonMinimize"), this.stopButton.addClass("entryRemove"), this.stopButton.innerHTML = Lang.Workspace.stop, this.view_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.toggleStop();
    }), this.pauseButton = Entry.createElement("button"), this.pauseButton.innerHTML = Lang.Workspace.pause, this.pauseButton.addClass("entryEngineButtonMinimize"), this.pauseButton.addClass("entryPauseButtonMinimize"), this.pauseButton.addClass("entryRemove"), this.view_.appendChild(this.pauseButton), this.pauseButton.bindOnClick(function(a) {
      this.blur();
      Entry.engine.togglePause();
    }), this.mouseView = Entry.createElement("div"), this.mouseView.addClass("entryMouseViewMinimize"), this.mouseView.addClass("entryRemove"), this.view_.appendChild(this.mouseView)) : "phone" == a && (this.view_ = b, this.view_.addClass("entryEngine", "entryEnginePhone"), this.headerView_ = Entry.createElement("div", "entryEngineHeader"), this.headerView_.addClass("entryEngineHeaderPhone"), this.view_.appendChild(this.headerView_), this.maximizeButton = Entry.createElement("button"), this.maximizeButton.addClass("entryEngineButtonPhone", 
    "entryMaximizeButtonPhone"), this.headerView_.appendChild(this.maximizeButton), this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.footerView_.addClass("entryRemove");
      Entry.engine.headerView_.addClass("entryRemove");
      Entry.launchFullScreen(Entry.engine.view_);
    }), document.addEventListener("fullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("webkitfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), document.addEventListener("mozfullscreenchange", function(a) {
      Entry.engine.exitFullScreen();
    }), this.footerView_ = Entry.createElement("div", "entryEngineFooter"), this.footerView_.addClass("entryEngineFooterPhone"), this.view_.appendChild(this.footerView_), this.runButton = Entry.createElement("button"), this.runButton.addClass("entryEngineButtonPhone", "entryRunButtonPhone"), Entry.objectAddable && this.runButton.addClass("small"), this.runButton.innerHTML = Lang.Workspace.run, this.footerView_.appendChild(this.runButton), this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    }), this.stopButton = Entry.createElement("button"), this.stopButton.addClass("entryEngineButtonPhone", "entryStopButtonPhone", "entryRemove"), Entry.objectAddable && this.stopButton.addClass("small"), this.stopButton.innerHTML = Lang.Workspace.stop, this.footerView_.appendChild(this.stopButton), this.stopButton.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    }));
  } else {
    this.view_ = b;
    this.view_.addClass("entryEngine_w");
    this.view_.addClass("entryEngineWorkspace_w");
    var d = Entry.createElement("button");
    this.speedButton = d;
    this.speedButton.addClass("entrySpeedButtonWorkspace", "entryEngineTopWorkspace", "entryEngineButtonWorkspace_w");
    this.view_.appendChild(this.speedButton);
    this.speedButton.bindOnClick(function(a) {
      Entry.engine.toggleSpeedPanel();
      d.blur();
    });
    this.maximizeButton = Entry.createElement("button");
    this.maximizeButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryMaximizeButtonWorkspace_w");
    this.view_.appendChild(this.maximizeButton);
    this.maximizeButton.bindOnClick(function(a) {
      Entry.engine.toggleFullscreen();
    });
    var c = Entry.createElement("button");
    this.coordinateButton = c;
    this.coordinateButton.addClass("entryEngineButtonWorkspace_w", "entryEngineTopWorkspace", "entryCoordinateButtonWorkspace_w");
    this.view_.appendChild(this.coordinateButton);
    this.coordinateButton.bindOnClick(function(a) {
      this.hasClass("toggleOn") ? this.removeClass("toggleOn") : this.addClass("toggleOn");
      c.blur();
      Entry.stage.toggleCoordinator();
    });
    this.addButton = Entry.createElement("button");
    this.addButton.addClass("entryEngineButtonWorkspace_w");
    this.addButton.addClass("entryAddButtonWorkspace_w");
    this.addButton.innerHTML = Lang.Workspace.add_object;
    this.addButton.bindOnClick(function(a) {
      Entry.dispatchEvent("openSpriteManager");
    });
    this.view_.appendChild(this.addButton);
    this.runButton = Entry.createElement("button");
    this.runButton.addClass("entryEngineButtonWorkspace_w");
    this.runButton.addClass("entryRunButtonWorkspace_w");
    this.runButton.innerHTML = Lang.Workspace.run;
    this.view_.appendChild(this.runButton);
    this.runButton.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    });
    this.runButton2 = Entry.createElement("button");
    this.runButton2.addClass("entryEngineButtonWorkspace_w");
    this.runButton2.addClass("entryRunButtonWorkspace_w2");
    this.view_.appendChild(this.runButton2);
    this.runButton2.bindOnClick(function(a) {
      Entry.engine.toggleRun();
    });
    this.stopButton = Entry.createElement("button");
    this.stopButton.addClass("entryEngineButtonWorkspace_w");
    this.stopButton.addClass("entryStopButtonWorkspace_w");
    this.stopButton.addClass("entryRemove");
    this.stopButton.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton);
    this.stopButton.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    });
    this.stopButton2 = Entry.createElement("button");
    this.stopButton2.addClass("entryEngineButtonWorkspace_w");
    this.stopButton2.addClass("entryStopButtonWorkspace_w2");
    this.stopButton2.addClass("entryRemove");
    this.stopButton2.innerHTML = Lang.Workspace.stop;
    this.view_.appendChild(this.stopButton2);
    this.stopButton2.bindOnClick(function(a) {
      Entry.engine.toggleStop();
    });
    this.pauseButton = Entry.createElement("button");
    this.pauseButton.addClass("entryEngineButtonWorkspace_w");
    this.pauseButton.addClass("entryPauseButtonWorkspace_w");
    this.pauseButton.addClass("entryRemove");
    this.view_.appendChild(this.pauseButton);
    this.pauseButton.bindOnClick(function(a) {
      Entry.engine.togglePause();
    });
    this.mouseView = Entry.createElement("div");
    this.mouseView.addClass("entryMouseViewWorkspace_w");
    this.mouseView.addClass("entryRemove");
    this.view_.appendChild(this.mouseView);
  }
};
Entry.Engine.prototype.toggleSpeedPanel = function() {
  if (this.speedPanelOn) {
    this.speedPanelOn = !1, $(Entry.stage.canvas.canvas).animate({top:"24px"}), this.coordinateButton.removeClass("entryRemove"), this.maximizeButton.removeClass("entryRemove"), this.mouseView.removeClass("entryRemoveElement"), $(this.speedLabel_).remove(), delete this.speedLabel_, $(this.speedProgress_).fadeOut(null, function(a) {
      $(this).remove();
      delete this.speedProgress_;
    }), $(this.speedHandle_).remove(), delete this.speedHandle_;
  } else {
    this.speedPanelOn = !0;
    $(Entry.stage.canvas.canvas).animate({top:"41px"});
    this.coordinateButton.addClass("entryRemove");
    this.maximizeButton.addClass("entryRemove");
    this.mouseView.addClass("entryRemoveElement");
    this.speedLabel_ = Entry.createElement("div", "entrySpeedLabelWorkspace");
    this.speedLabel_.innerHTML = Lang.Workspace.speed;
    this.view_.insertBefore(this.speedLabel_, this.maximizeButton);
    this.speedProgress_ = Entry.createElement("table", "entrySpeedProgressWorkspace");
    for (var b = Entry.createElement("tr"), a = this.speeds, d = 0;5 > d;d++) {
      (function(d) {
        var e = Entry.createElement("td", "progressCell" + d);
        e.bindOnClick(function() {
          Entry.engine.setSpeedMeter(a[d]);
        });
        b.appendChild(e);
      })(d);
    }
    this.view_.insertBefore(this.speedProgress_, this.maximizeButton);
    this.speedProgress_.appendChild(b);
    this.speedHandle_ = Entry.createElement("div", "entrySpeedHandleWorkspace");
    d = (Entry.interfaceState.canvasWidth - 84) / 5;
    $(this.speedHandle_).draggable({axis:"x", grid:[d, d], containment:[80, 0, 4 * d + 80, 0], drag:function(a, b) {
      var d = (b.position.left - 80) / (Entry.interfaceState.canvasWidth - 84) * 5, d = Math.floor(d);
      0 > d || Entry.engine.setSpeedMeter(Entry.engine.speeds[d]);
    }});
    this.view_.insertBefore(this.speedHandle_, this.maximizeButton);
    this.setSpeedMeter(Entry.FPS);
  }
};
Entry.Engine.prototype.setSpeedMeter = function(b) {
  var a = this.speeds.indexOf(b);
  0 > a || (a = Math.min(4, a), a = Math.max(0, a), this.speedPanelOn && (this.speedHandle_.style.left = (Entry.interfaceState.canvasWidth - 80) / 10 * (2 * a + 1) + 80 - 9 + "px"), Entry.FPS != b && (clearInterval(this.ticker), this.ticker = setInterval(this.update, Math.floor(1E3 / b)), Entry.FPS = b));
};
Entry.Engine.prototype.start = function(b) {
  createjs.Ticker.setFPS(Entry.FPS);
  this.ticker = setInterval(this.update, Math.floor(1E3 / Entry.FPS));
};
Entry.Engine.prototype.stop = function() {
  clearInterval(this.ticker);
  this.ticker = null;
};
Entry.Engine.prototype.update = function() {
  Entry.engine.isState("run") && (Entry.engine.computeObjects(), Entry.hw.update());
};
Entry.Engine.prototype.computeObjects = function() {
  Entry.container.mapObjectOnScene(this.computeFunction);
};
Entry.Engine.prototype.computeFunction = function(b) {
  b.script.tick();
};
Entry.Engine.computeThread = function(b, a) {
  Entry.engine.isContinue = !0;
  for (var d = !1;a && Entry.engine.isContinue && !d;) {
    Entry.engine.isContinue = !a.isRepeat;
    var c = a.run(), d = c && c === a;
    a = c;
  }
  return a;
};
Entry.Engine.prototype.isState = function(b) {
  return -1 < this.state.indexOf(b);
};
Entry.Engine.prototype.run = function() {
  this.isState("run") ? this.toggleStop() : (this.isState("stop") || this.isState("pause")) && this.toggleRun();
};
Entry.Engine.prototype.toggleRun = function() {
  Entry.addActivity("run");
  "stop" == this.state && (Entry.container.mapEntity(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapVariable(function(b) {
    b.takeSnapshot();
  }), Entry.variableContainer.mapList(function(b) {
    b.takeSnapshot();
  }), Entry.container.takeSequenceSnapshot(), Entry.scene.takeStartSceneSnapshot(), this.state = "run", this.fireEvent("start"));
  this.state = "run";
  "mobile" == Entry.type && this.view_.addClass("entryEngineBlueWorkspace");
  this.pauseButton.innerHTML = Lang.Workspace.pause;
  this.runButton.addClass("run");
  this.runButton.addClass("entryRemove");
  this.stopButton.removeClass("entryRemove");
  this.pauseButton && this.pauseButton.removeClass("entryRemove");
  this.runButton2 && this.runButton2.addClass("entryRemove");
  this.stopButton2 && this.stopButton2.removeClass("entryRemove");
  this.isUpdating || (Entry.engine.update(), Entry.engine.isUpdating = !0);
  Entry.stage.selectObject();
  Entry.dispatchEvent("run");
};
Entry.Engine.prototype.toggleStop = function() {
  Entry.addActivity("stop");
  var b = Entry.container, a = Entry.variableContainer;
  b.mapEntity(function(a) {
    a.loadSnapshot();
    a.object.filters = [];
    a.resetFilter();
    a.dialog && a.dialog.remove();
    a.brush && a.removeBrush();
  });
  a.mapVariable(function(a) {
    a.loadSnapshot();
  });
  a.mapList(function(a) {
    a.loadSnapshot();
    a.updateView();
  });
  this.stopProjectTimer();
  b.clearRunningState();
  b.loadSequenceSnapshot();
  b.setInputValue();
  Entry.scene.loadStartSceneSnapshot();
  Entry.Func.clearThreads();
  createjs.Sound.setVolume(1);
  createjs.Sound.stop();
  this.view_.removeClass("entryEngineBlueWorkspace");
  this.runButton.removeClass("entryRemove");
  this.stopButton.addClass("entryRemove");
  this.pauseButton && this.pauseButton.addClass("entryRemove");
  this.runButton2 && this.runButton2.removeClass("entryRemove");
  this.stopButton2 && this.stopButton2.addClass("entryRemove");
  this.state = "stop";
  Entry.dispatchEvent("stop");
  Entry.stage.hideInputField();
};
Entry.Engine.prototype.togglePause = function() {
  "pause" == this.state ? (this.state = "run", this.pauseButton.innerHTML = Lang.Workspace.pause) : (this.state = "pause", this.pauseButton.innerHTML = Lang.Workspace.restart, this.runButton.removeClass("entryRemove"), this.stopButton.removeClass("entryRemove"));
};
Entry.Engine.prototype.fireEvent = function(b) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEvent, b);
};
Entry.Engine.prototype.raiseEvent = function(b, a) {
  b.parent.script.raiseEvent(a, b);
};
Entry.Engine.prototype.fireEventOnEntity = function(b, a) {
  "run" == this.state && Entry.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [a, b]);
};
Entry.Engine.prototype.raiseEventOnEntity = function(b, a) {
  b === a[0] && b.parent.script.raiseEvent(a[1], b);
};
Entry.Engine.prototype.captureKeyEvent = function(b) {
  var a = b.keyCode, d = Entry.type;
  b.ctrlKey && "workspace" == d ? 83 == a ? (b.preventDefault(), Entry.dispatchEvent("saveWorkspace")) : 82 == a ? (b.preventDefault(), Entry.engine.run()) : 90 == a && (b.preventDefault(), console.log("engine"), Entry.dispatchEvent(b.shiftKey ? "redo" : "undo")) : Entry.engine.isState("run") && Entry.container.mapEntityIncludeCloneOnScene(Entry.engine.raiseKeyEvent, ["keyPress", a]);
  Entry.engine.isState("stop") && "workspace" === d && 37 <= a && 40 >= a && Entry.stage.moveSprite(b);
};
Entry.Engine.prototype.raiseKeyEvent = function(b, a) {
  return b.parent.script.raiseEvent(a[0], b, String(a[1]));
};
Entry.Engine.prototype.updateMouseView = function() {
  var b = Entry.stage.mouseCoordinate;
  this.mouseView.innerHTML = "X : " + b.x + ", Y : " + b.y;
  this.mouseView.removeClass("entryRemove");
};
Entry.Engine.prototype.hideMouseView = function() {
  this.mouseView.addClass("entryRemove");
};
Entry.Engine.prototype.toggleFullscreen = function() {
  if (this.popup) {
    this.popup.remove(), this.popup = null;
  } else {
    this.popup = new Entry.Popup;
    if ("workspace" != Entry.type) {
      var b = $(document);
      $(this.popup.body_).css("top", b.scrollTop());
      $("body").css("overflow", "hidden");
      popup.window_.appendChild(Entry.stage.canvas.canvas);
    }
    popup.window_.appendChild(Entry.engine.view_);
  }
};
Entry.Engine.prototype.exitFullScreen = function() {
  document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen || (Entry.engine.footerView_.removeClass("entryRemove"), Entry.engine.headerView_.removeClass("entryRemove"));
};
Entry.Engine.prototype.showProjectTimer = function() {
  Entry.engine.projectTimer && this.projectTimer.setVisible(!0);
};
Entry.Engine.prototype.hideProjectTimer = function() {
  var b = this.projectTimer;
  if (b && b.isVisible() && !this.isState("run")) {
    for (var a = Entry.container.getAllObjects(), d = ["get_project_timer_value", "reset_project_timer", "set_visible_project_timer", "choose_project_timer_action"], c = 0, e = a.length;c < e;c++) {
      for (var f = a[c].script, g = 0;g < d.length;g++) {
        if (f.hasBlockType(d[g])) {
          return;
        }
      }
    }
    b.setVisible(!1);
  }
};
Entry.Engine.prototype.clearTimer = function() {
  clearInterval(this.ticker);
  clearInterval(this.projectTimer.tick);
};
Entry.Engine.prototype.startProjectTimer = function() {
  var b = this.projectTimer;
  b && (b.start = (new Date).getTime(), b.isInit = !0, b.pausedTime = 0, b.tick = setInterval(function(a) {
    Entry.engine.updateProjectTimer();
  }, 1E3 / 60));
};
Entry.Engine.prototype.stopProjectTimer = function() {
  var b = this.projectTimer;
  b && (this.updateProjectTimer(0), b.isPaused = !1, b.isInit = !1, b.pausedTime = 0, clearInterval(b.tick));
};
Entry.Engine.prototype.updateProjectTimer = function(b) {
  var a = Entry.engine.projectTimer, d = (new Date).getTime();
  a && ("undefined" == typeof b ? a.isPaused || a.setValue((d - a.start - a.pausedTime) / 1E3) : (a.setValue(b), a.pausedTime = 0, a.start = d));
};
Entry.EntityObject = function(b) {
  this.parent = b;
  this.type = b.objectType;
  this.flip = !1;
  this.collision = Entry.Utils.COLLISION.NONE;
  this.id = Entry.generateHash();
  "sprite" == this.type ? (this.object = new createjs.Bitmap, this.effect = {}, this.setInitialEffectValue()) : "textBox" == this.type && (this.object = new createjs.Container, this.textObject = new createjs.Text, this.textObject.font = "20px Nanum Gothic", this.textObject.textBaseline = "middle", this.textObject.textAlign = "center", this.bgObject = new createjs.Shape, this.bgObject.graphics.setStrokeStyle(1).beginStroke("#f00").drawRect(0, 0, 100, 100), this.object.addChild(this.bgObject), this.object.addChild(this.textObject), 
  this.fontType = "Nanum Gothic", this.fontSize = 20, this.strike = this.underLine = this.fontItalic = this.fontBold = !1);
  this.object.entity = this;
  this.object.cursor = "pointer";
  this.object.on("mousedown", function(a) {
    var b = this.entity.parent.id;
    Entry.dispatchEvent("entityClick", this.entity);
    Entry.stage.isObjectClick = !0;
    "minimize" != Entry.type && Entry.engine.isState("stop") && (this.offset = {x:-this.parent.x + this.entity.getX() - (.75 * a.stageX - 240), y:-this.parent.y - this.entity.getY() - (.75 * a.stageY - 135)}, this.cursor = "move", this.entity.initCommand(), Entry.container.selectObject(b));
  });
  this.object.on("pressup", function(a) {
    Entry.dispatchEvent("entityClickCanceled", this.entity);
    this.cursor = "pointer";
    this.entity.checkCommand();
  });
  this.object.on("pressmove", function(a) {
    "minimize" != Entry.type && Entry.engine.isState("stop") && !this.entity.parent.getLock() && (this.entity.doCommand(), this.entity.setX(.75 * a.stageX - 240 + this.offset.x), this.entity.setY(-(.75 * a.stageY - 135) - this.offset.y), Entry.stage.updateObject());
  });
};
Entry.EntityObject.prototype.injectModel = function(b, a) {
  if ("sprite" == this.type) {
    this.setImage(b);
  } else {
    if ("textBox" == this.type) {
      var d = this.parent;
      a.text = a.text || d.text || d.name;
      this.setFont(a.font);
      this.setBGColour(a.bgColor);
      this.setColour(a.colour);
      this.setUnderLine(a.underLine);
      this.setStrike(a.strike);
      this.setText(a.text);
    }
  }
  a && this.syncModel_(a);
};
Entry.EntityObject.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.setRegX(b.regX);
  this.setRegY(b.regY);
  this.setScaleX(b.scaleX);
  this.setScaleY(b.scaleY);
  this.setRotation(b.rotation);
  this.setDirection(b.direction, !0);
  this.setLineBreak(b.lineBreak);
  this.setWidth(b.width);
  this.setHeight(b.height);
  this.setText(b.text);
  this.setTextAlign(b.textAlign);
  this.setFontSize(b.fontSize || this.getFontSize());
  this.setVisible(b.visible);
};
Entry.EntityObject.prototype.initCommand = function() {
  Entry.engine.isState("stop") && (this.isCommandValid = !1, Entry.stateManager && Entry.stateManager.addCommand("edit entity", this, this.restoreEntity, this.toJSON()));
};
Entry.EntityObject.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.EntityObject.prototype.checkCommand = function() {
  Entry.engine.isState("stop") && !this.isCommandValid && Entry.dispatchEvent("cancelLastCommand");
};
Entry.EntityObject.prototype.restoreEntity = function(b) {
  var a = this.toJSON();
  this.syncModel_(b);
  Entry.dispatchEvent("updateObject");
  Entry.stateManager && Entry.stateManager.addCommand("restore object", this, this.restoreEntity, a);
};
Entry.EntityObject.prototype.setX = function(b) {
  "number" == typeof b && (this.x = b, this.object.x = this.x, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getX = function() {
  return this.x;
};
Entry.EntityObject.prototype.setY = function(b) {
  "number" == typeof b && (this.y = b, this.object.y = -this.y, this.isClone || this.parent.updateCoordinateView(), this.updateDialog());
};
Entry.EntityObject.prototype.getY = function() {
  return this.y;
};
Entry.EntityObject.prototype.getDirection = function() {
  return this.direction;
};
Entry.EntityObject.prototype.setDirection = function(b, a) {
  b || (b = 0);
  "vertical" != this.parent.getRotateMethod() || a || (0 <= this.direction && 180 > this.direction) == (0 <= b && 180 > b) || (this.setScaleX(-this.getScaleX()), Entry.stage.updateObject(), this.flip = !this.flip);
  this.direction = b.mod(360);
  this.object.direction = this.direction;
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.setRotation = function(b) {
  "free" != this.parent.getRotateMethod() && (b = 0);
  this.rotation = b.mod(360);
  this.object.rotation = this.rotation;
  this.updateDialog();
  this.isClone || this.parent.updateRotationView();
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.getRotation = function() {
  return this.rotation;
};
Entry.EntityObject.prototype.setRegX = function(b) {
  "textBox" == this.type && (b = 0);
  this.regX = b;
  this.object.regX = this.regX;
};
Entry.EntityObject.prototype.getRegX = function() {
  return this.regX;
};
Entry.EntityObject.prototype.setRegY = function(b) {
  "textBox" == this.type && (b = 0);
  this.regY = b;
  this.object.regY = this.regY;
};
Entry.EntityObject.prototype.getRegY = function() {
  return this.regY;
};
Entry.EntityObject.prototype.setScaleX = function(b) {
  this.scaleX = b;
  this.object.scaleX = this.scaleX;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleX = function() {
  return this.scaleX;
};
Entry.EntityObject.prototype.setScaleY = function(b) {
  this.scaleY = b;
  this.object.scaleY = this.scaleY;
  this.parent.updateCoordinateView();
  this.updateDialog();
};
Entry.EntityObject.prototype.getScaleY = function() {
  return this.scaleY;
};
Entry.EntityObject.prototype.setSize = function(b) {
  1 > b && (b = 1);
  b /= this.getSize();
  this.setScaleX(this.getScaleX() * b);
  this.setScaleY(this.getScaleY() * b);
  this.isClone || this.parent.updateCoordinateView();
};
Entry.EntityObject.prototype.getSize = function() {
  return (this.getWidth() * Math.abs(this.getScaleX()) + this.getHeight() * Math.abs(this.getScaleY())) / 2;
};
Entry.EntityObject.prototype.setWidth = function(b) {
  this.width = b;
  this.object.width = this.width;
  this.textObject && this.getLineBreak() && (this.textObject.lineWidth = this.width);
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getWidth = function() {
  return this.width;
};
Entry.EntityObject.prototype.setHeight = function(b) {
  this.height = b;
  this.textObject && (this.object.height = this.height, this.alignTextBox());
  this.updateDialog();
  this.updateBG();
};
Entry.EntityObject.prototype.getHeight = function() {
  return this.height;
};
Entry.EntityObject.prototype.setColour = function(b) {
  b || (b = "#000000");
  this.colour = b;
  this.textObject && (this.textObject.color = this.colour);
};
Entry.EntityObject.prototype.getColour = function() {
  return this.colour;
};
Entry.EntityObject.prototype.setBGColour = function(b) {
  b || (b = "transparent");
  this.bgColor = b;
  this.updateBG();
};
Entry.EntityObject.prototype.getBGColour = function() {
  return this.bgColor;
};
Entry.EntityObject.prototype.setUnderLine = function(b) {
  void 0 === b && (b = !1);
  this.underLine = b;
  this.textObject.underLine = b;
};
Entry.EntityObject.prototype.getUnderLine = function() {
  return this.underLine;
};
Entry.EntityObject.prototype.setStrike = function(b) {
  void 0 === b && (b = !1);
  this.strike = b;
  this.textObject.strike = b;
};
Entry.EntityObject.prototype.getStrike = function() {
  return this.strike;
};
Entry.EntityObject.prototype.getFont = function() {
  var b = [];
  this.fontBold && b.push("bold");
  this.fontItalic && b.push("italic");
  b.push(this.getFontSize() + "px");
  b.push(this.fontType);
  return b.join(" ");
};
Entry.EntityObject.prototype.setFont = function(b) {
  if ("textBox" == this.parent.objectType && this.font !== b) {
    b || (b = "20px Nanum Gothic");
    var a = b.split(" "), d = 0;
    if (d = -1 < a.indexOf("bold")) {
      a.splice(d - 1, 1), this.setFontBold(!0);
    }
    if (d = -1 < a.indexOf("italic")) {
      a.splice(d - 1, 1), this.setFontItalic(!0);
    }
    d = parseInt(a.shift());
    this.setFontSize(d);
    this.setFontType(a.join(" "));
    this.font = this.getFont();
    this.textObject.font = b;
    Entry.stage.update();
    this.setWidth(this.textObject.getMeasuredWidth());
    this.updateBG();
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.syncFont = function() {
  this.textObject.font = this.getFont();
  Entry.stage.update();
  this.getLineBreak() || this.setWidth(this.textObject.getMeasuredWidth());
  Entry.stage.updateObject();
};
Entry.EntityObject.prototype.getFontType = function() {
  return this.fontType;
};
Entry.EntityObject.prototype.setFontType = function(b) {
  "textBox" == this.parent.objectType && (this.fontType = b ? b : "Nanum Gothic", this.syncFont());
};
Entry.EntityObject.prototype.getFontSize = function(b) {
  return this.fontSize;
};
Entry.EntityObject.prototype.setFontSize = function(b) {
  "textBox" == this.parent.objectType && this.fontSize != b && (this.fontSize = b ? b : 20, this.syncFont(), this.alignTextBox());
};
Entry.EntityObject.prototype.setFontBold = function(b) {
  this.fontBold = b;
};
Entry.EntityObject.prototype.toggleFontBold = function() {
  this.fontBold = !this.fontBold;
  this.syncFont();
  return this.fontBold;
};
Entry.EntityObject.prototype.setFontItalic = function(b) {
  this.fontItalic = b;
};
Entry.EntityObject.prototype.toggleFontItalic = function() {
  this.fontItalic = !this.fontItalic;
  this.syncFont();
  return this.fontItalic;
};
Entry.EntityObject.prototype.setFontName = function(b) {
  for (var a = this.font.split(" "), d = [], c = 0, e = a.length;c < e;c++) {
    ("bold" === a[c] || "italic" === a[c] || -1 < a[c].indexOf("px")) && d.push(a[c]);
  }
  this.setFont(d.join(" ") + " " + b);
};
Entry.EntityObject.prototype.getFontName = function() {
  if ("textBox" == this.type) {
    if (!this.font) {
      return "";
    }
    for (var b = this.font.split(" "), a = [], d = 0, c = b.length;d < c;d++) {
      "bold" !== b[d] && "italic" !== b[d] && -1 === b[d].indexOf("px") && a.push(b[d]);
    }
    return a.join(" ").trim();
  }
};
Entry.EntityObject.prototype.setText = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = ""), this.text = b, this.textObject.text = this.text, this.lineBreak || (this.setWidth(this.textObject.getMeasuredWidth()), this.parent.updateCoordinateView()), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getText = function() {
  return this.text;
};
Entry.EntityObject.prototype.setTextAlign = function(b) {
  "textBox" == this.parent.objectType && (void 0 === b && (b = Entry.TEXT_ALIGN_CENTER), this.textAlign = b, this.textObject.textAlign = Entry.TEXT_ALIGNS[this.textAlign], this.alignTextBox(), this.updateBG(), Entry.stage.updateObject());
};
Entry.EntityObject.prototype.getTextAlign = function() {
  return this.textAlign;
};
Entry.EntityObject.prototype.setLineBreak = function(b) {
  if ("textBox" == this.parent.objectType) {
    void 0 === b && (b = !1);
    var a = this.lineBreak;
    this.lineBreak = b;
    a && !this.lineBreak ? (this.textObject.lineWidth = null, this.setHeight(this.textObject.getMeasuredLineHeight()), this.setText(this.getText().replace(/\n/g, ""))) : !a && this.lineBreak && (this.setFontSize(this.getFontSize() * this.getScaleX()), this.setHeight(3 * this.textObject.getMeasuredLineHeight()), this.setWidth(this.getWidth() * this.getScaleX()), this.setScaleX(1), this.setScaleY(1), this.textObject.lineWidth = this.getWidth(), this.alignTextBox());
    Entry.stage.updateObject();
  }
};
Entry.EntityObject.prototype.getLineBreak = function() {
  return this.lineBreak;
};
Entry.EntityObject.prototype.setVisible = function(b) {
  void 0 === b && (b = !0);
  this.visible = b;
  this.object.visible = this.visible;
  this.dialog && this.syncDialogVisible();
  return this.visible;
};
Entry.EntityObject.prototype.getVisible = function() {
  return this.visible;
};
Entry.EntityObject.prototype.setImage = function(b) {
  delete b._id;
  Entry.assert("sprite" == this.type, "Set image is only for sprite object");
  b.id || (b.id = Entry.generateHash());
  this.picture = b;
  var a = this.picture.dimension, d = this.getRegX() - this.getWidth() / 2, c = this.getRegY() - this.getHeight() / 2;
  this.setWidth(a.width);
  this.setHeight(a.height);
  a.scaleX || (a.scaleX = this.getScaleX(), a.scaleY = this.getScaleY());
  this.setScaleX(this.scaleX);
  this.setScaleY(this.scaleY);
  this.setRegX(this.width / 2 + d);
  this.setRegY(this.height / 2 + c);
  var e = Entry.container.getCachedPicture(b.id);
  if (e) {
    Entry.image = e, this.object.image = e, this.object.cache(0, 0, this.getWidth(), this.getHeight());
  } else {
    e = new Image;
    b.fileurl ? e.src = b.fileurl : (a = b.filename, e.src = Entry.defaultPath + "/uploads/" + a.substring(0, 2) + "/" + a.substring(2, 4) + "/image/" + a + ".png");
    var f = this;
    e.onload = function(a) {
      Entry.container.cachePicture(b.id, e);
      Entry.image = e;
      f.object.image = e;
      f.object.cache(0, 0, f.getWidth(), f.getHeight());
      f = null;
    };
  }
  Entry.dispatchEvent("updateObject");
};
Entry.EntityObject.prototype.applyFilter = function() {
  var b = this.object, a = this.effect, d = [], c = Entry.adjustValueWithMaxMin;
  a.brightness = a.brightness;
  var e = new createjs.ColorMatrix;
  e.adjustColor(c(a.brightness, -100, 100), 0, 0, 0);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  a.hue = a.hue.mod(360);
  e = new createjs.ColorMatrix;
  e.adjustColor(0, 0, 0, a.hue);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  var e = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], f = 10.8 * a.hsv * Math.PI / 180, g = Math.cos(f), f = Math.sin(f), h = Math.abs(a.hsv / 100);
  1 < h && (h -= Math.floor(h));
  0 < h && .33 >= h ? e = [1, 0, 0, 0, 0, 0, g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .66 >= h ? e = [g, 0, f, 0, 0, 0, 1, 0, 0, 0, f, 0, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1] : .99 >= h && (e = [g, f, 0, 0, 0, -1 * f, g, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
  e = (new createjs.ColorMatrix).concat(e);
  e = new createjs.ColorMatrixFilter(e);
  d.push(e);
  b.alpha = a.alpha = c(a.alpha, 0, 1);
  b.filters = d;
  b.cache(0, 0, this.getWidth(), this.getHeight());
};
Entry.EntityObject.prototype.resetFilter = function() {
  "sprite" == this.parent.objectType && (this.object.filters = [], this.setInitialEffectValue(), this.object.alpha = this.effect.alpha, this.object.cache(0, 0, this.getWidth(), this.getHeight()));
};
Entry.EntityObject.prototype.updateDialog = function() {
  this.dialog && this.dialog.update();
};
Entry.EntityObject.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
  this.collision = Entry.Utils.COLLISION.NONE;
};
Entry.EntityObject.prototype.loadSnapshot = function() {
  this.snapshot_ && this.syncModel_(this.snapshot_);
  "sprite" == this.parent.objectType && this.setImage(this.parent.getPicture());
};
Entry.EntityObject.prototype.removeClone = function() {
  if (this.isClone) {
    this.dialog && this.dialog.remove();
    this.brush && this.removeBrush();
    Entry.stage.unloadEntity(this);
    var b = this.parent.clonedEntities.indexOf(this);
    this.parent.clonedEntities.splice(b, 1);
    Entry.Utils.isFunction(this.clearExecutor) && this.clearExecutor();
  }
};
Entry.EntityObject.prototype.clearExecutor = function() {
  this.parent.script.clearExecutorsByEntity(this);
};
Entry.EntityObject.prototype.toJSON = function() {
  var b = {};
  b.x = Entry.cutDecimal(this.getX());
  b.y = Entry.cutDecimal(this.getY());
  b.regX = Entry.cutDecimal(this.getRegX());
  b.regY = Entry.cutDecimal(this.getRegY());
  b.scaleX = this.getScaleX();
  b.scaleY = this.getScaleY();
  b.rotation = Entry.cutDecimal(this.getRotation());
  b.direction = Entry.cutDecimal(this.getDirection());
  b.width = Entry.cutDecimal(this.getWidth());
  b.height = Entry.cutDecimal(this.getHeight());
  b.font = this.getFont();
  b.visible = this.getVisible();
  "textBox" == this.parent.objectType && (b.colour = this.getColour(), b.text = this.getText(), b.textAlign = this.getTextAlign(), b.lineBreak = this.getLineBreak(), b.bgColor = this.getBGColour(), b.underLine = this.getUnderLine(), b.strike = this.getStrike(), b.fontSize = this.getFontSize());
  return b;
};
Entry.EntityObject.prototype.setInitialEffectValue = function() {
  this.effect = {blur:0, hue:0, hsv:0, brightness:0, contrast:0, saturation:0, alpha:1};
};
Entry.EntityObject.prototype.removeBrush = function() {
  Entry.stage.selectedObjectContainer.removeChild(this.shape);
  this.shape = this.brush = null;
};
Entry.EntityObject.prototype.updateBG = function() {
  if (this.bgObject) {
    this.bgObject.graphics.clear();
    var b = this.getWidth(), a = this.getHeight();
    this.bgObject.graphics.setStrokeStyle(1).beginStroke().beginFill(this.getBGColour()).drawRect(-b / 2, -a / 2, b, a);
    if (this.getLineBreak()) {
      this.bgObject.x = 0;
    } else {
      switch(this.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          this.bgObject.x = b / 2;
          break;
        case Entry.TEXT_ALIGN_CENTER:
          this.bgObject.x = 0;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          this.bgObject.x = -b / 2;
      }
    }
  }
};
Entry.EntityObject.prototype.alignTextBox = function() {
  if ("textBox" == this.type) {
    var b = this.textObject;
    if (this.lineBreak) {
      var a = b.getMeasuredLineHeight();
      b.y = a / 2 - this.getHeight() / 2;
      switch(this.textAlign) {
        case Entry.TEXT_ALIGN_CENTER:
          b.x = 0;
          break;
        case Entry.TEXT_ALIGN_LEFT:
          b.x = -this.getWidth() / 2;
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          b.x = this.getWidth() / 2;
      }
      b.maxHeight = this.getHeight();
    } else {
      b.x = 0, b.y = 0;
    }
  }
};
Entry.EntityObject.prototype.syncDialogVisible = function() {
  this.dialog && (this.dialog.object.visible = this.visible);
};
Entry.Helper = function() {
  this.visible = !1;
};
p = Entry.Helper.prototype;
p.generateView = function(b, a) {
  if (!this.parentView_) {
    this.parentView_ = b;
    this.blockHelpData = EntryStatic.blockInfo;
    var d = Entry.createElement("div", "entryBlockHelperWorkspace");
    this.view = d;
    Entry.isForLecture && d.addClass("lecture");
    this.parentView_.appendChild(d);
    if (!Entry.isForLecture) {
      var c = Entry.createElement("div", "entryBlockHelperHeaderWorkspace");
      c.innerHTML = Lang.Helper.Block_info;
      d.appendChild(c);
    }
    c = Entry.createElement("div", "entryBlockHelperContentWorkspace");
    c.addClass("entryBlockHelperIntro");
    Entry.isForLecture && c.addClass("lecture");
    d.appendChild(c);
    this.blockHelperContent_ = c;
    this.blockHelperView_ = d;
    d = Entry.createElement("div", "entryBlockHelperBlockWorkspace");
    this.blockHelperContent_.appendChild(d);
    c = Entry.createElement("div", "entryBlockHelperDescriptionWorkspace");
    this.blockHelperContent_.appendChild(c);
    c.innerHTML = Lang.Helper.Block_click_msg;
    this.blockHelperDescription_ = c;
    this._renderView = new Entry.RenderView($(d), "LEFT");
    this.code = new Entry.Code([]);
    this._renderView.changeCode(this.code);
    this.first = !0;
  }
};
p.bindWorkspace = function(b) {
  b && (this._blockViewObserver && this._blockViewObserver.destroy(), this.workspace = b, this._blockViewObserver = b.observe(this, "_updateSelectedBlock", ["selectedBlockView"]));
};
p._updateSelectedBlock = function() {
  var b = this.workspace.selectedBlockView;
  if (b && this.visible && b != this._blockView) {
    var a = b.block.type;
    this._blockView = b;
    this.renderBlock(a);
  }
};
p.renderBlock = function(b) {
  var a = Lang.Helper[b];
  if (b && this.visible && a && !Entry.block[b].isPrimitive) {
    this.first && (this.blockHelperContent_.removeClass("entryBlockHelperIntro"), this.first = !1);
    this.code.clear();
    var d = Entry.block[b].def, d = d || {type:b};
    this.code.createThread([d]);
    this.code.board.align();
    this.code.board.resize();
    var d = this.code.getThreads()[0].getFirstBlock().view, c = d.svgGroup.getBBox();
    b = c.width;
    c = c.height;
    d = d.getSkeleton().box(d).offsetX;
    isNaN(d) && (d = 0);
    this.blockHelperDescription_.innerHTML = a;
    this._renderView.align();
    $(this.blockHelperDescription_).css({top:c + 30});
    this._renderView.svgDom.css({"margin-left":-(b / 2) - 20 - d});
  }
};
p.getView = function() {
  return this.view;
};
p.resize = function() {
};
Entry.Activity = function(b, a) {
  this.name = b;
  this.timestamp = new Date;
  var d = [];
  if (void 0 !== a) {
    for (var c = 0, e = a.length;c < e;c++) {
      var f = a[c];
      d.push({key:f[0], value:f[1]});
    }
  }
  this.data = d;
};
Entry.ActivityReporter = function() {
  this._activities = [];
};
(function(b) {
  b.add = function(a) {
    if (!(a instanceof Entry.Activity)) {
      return console.error("Activity must be an instanceof Entry.MazeActivity");
    }
    this._activities.push(a);
  };
  b.clear = function() {
    this._activities = [];
  };
  b.get = function() {
    return this._activities;
  };
})(Entry.ActivityReporter.prototype);
Entry.State = function(b, a, d, c) {
  this.caller = a;
  this.func = d;
  3 < arguments.length && (this.params = Array.prototype.slice.call(arguments).slice(3));
  this.message = b;
  this.time = Entry.getUpTime();
  this.isPass = Entry.Command[b] ? Entry.Command[b].isPass : !1;
};
Entry.State.prototype.generateMessage = function() {
};
Entry.StateManager = function() {
  this.undoStack_ = [];
  this.redoStack_ = [];
  this.isIgnore = this.isRestore = !1;
  Entry.addEventListener("cancelLastCommand", function(b) {
    Entry.stateManager.cancelLastCommand();
  });
  Entry.addEventListener("run", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("stop", function(b) {
    Entry.stateManager.updateView();
  });
  Entry.addEventListener("saveWorkspace", function(b) {
    Entry.stateManager.addStamp();
  });
  Entry.addEventListener("undo", function(b) {
    Entry.stateManager.undo();
  });
  Entry.addEventListener("redo", function(b) {
    Entry.stateManager.redo();
  });
};
Entry.StateManager.prototype.generateView = function(b, a) {
};
Entry.StateManager.prototype.addCommand = function(b, a, d, c) {
  if (!this.isIgnoring()) {
    if (this.isRestoring()) {
      var e = new Entry.State, f = Array.prototype.slice.call(arguments);
      Entry.State.prototype.constructor.apply(e, f);
      this.redoStack_.push(e);
      Entry.reporter && Entry.reporter.report(e);
    } else {
      e = new Entry.State, f = Array.prototype.slice.call(arguments), Entry.State.prototype.constructor.apply(e, f), this.undoStack_.push(e), Entry.reporter && Entry.reporter.report(e), this.updateView();
    }
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.cancelLastCommand = function() {
  this.canUndo() && (this.undoStack_.pop(), this.updateView(), Entry.creationChangedEvent && Entry.creationChangedEvent.notify());
};
Entry.StateManager.prototype.getLastCommand = function() {
  return this.undoStack_[this.undoStack_.length - 1];
};
Entry.StateManager.prototype.undo = function() {
  if (this.canUndo() && !this.isRestoring()) {
    this.addActivity("undo");
    for (this.startRestore();this.undoStack_.length;) {
      var b = this.undoStack_.pop();
      b.func.apply(b.caller, b.params);
      if (!0 !== b.isPass) {
        break;
      }
    }
    this.updateView();
    this.endRestore();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.redo = function() {
  if (this.canRedo() && !this.isRestoring()) {
    this.addActivity("redo");
    var b = this.redoStack_.pop();
    b.func.apply(b.caller, b.params);
    this.updateView();
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  }
};
Entry.StateManager.prototype.updateView = function() {
  this.undoButton && this.redoButton && (this.canUndo() ? this.undoButton.addClass("active") : this.undoButton.removeClass("active"), this.canRedo() ? this.redoButton.addClass("active") : this.redoButton.removeClass("active"));
};
Entry.StateManager.prototype.startRestore = function() {
  this.isRestore = !0;
};
Entry.StateManager.prototype.endRestore = function() {
  this.isRestore = !1;
};
Entry.StateManager.prototype.isRestoring = function() {
  return this.isRestore;
};
Entry.StateManager.prototype.startIgnore = function() {
  this.isIgnore = !0;
};
Entry.StateManager.prototype.endIgnore = function() {
  this.isIgnore = !1;
};
Entry.StateManager.prototype.isIgnoring = function() {
  return this.isIgnore;
};
Entry.StateManager.prototype.canUndo = function() {
  return 0 < this.undoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.canRedo = function() {
  return 0 < this.redoStack_.length && Entry.engine.isState("stop");
};
Entry.StateManager.prototype.addStamp = function() {
  this.stamp = Entry.generateHash();
  this.undoStack_.length && (this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp);
};
Entry.StateManager.prototype.isSaved = function() {
  return 0 === this.undoStack_.length || this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp && "string" == typeof this.stamp;
};
Entry.StateManager.prototype.addActivity = function(b) {
  Entry.reporter && Entry.reporter.report(new Entry.State(b));
};
Entry.EntryObject = function(b) {
  if (b) {
    this.id = b.id;
    this.name = b.name || b.sprite.name;
    this.text = b.text || this.name;
    this.objectType = b.objectType;
    this.objectType || (this.objectType = "sprite");
    this.script = new Entry.Code(b.script ? b.script : [], this);
    this.pictures = b.sprite.pictures;
    this.sounds = [];
    this.sounds = b.sprite.sounds;
    for (var a = 0;a < this.sounds.length;a++) {
      this.sounds[a].id || (this.sounds[a].id = Entry.generateHash()), Entry.initSound(this.sounds[a]);
    }
    this.lock = b.lock ? b.lock : !1;
    this.isEditing = !1;
    "sprite" == this.objectType && (this.selectedPicture = b.selectedPictureId ? this.getPicture(b.selectedPictureId) : this.pictures[0]);
    this.scene = Entry.scene.getSceneById(b.scene) || Entry.scene.selectedScene;
    this.setRotateMethod(b.rotateMethod);
    this.entity = new Entry.EntityObject(this);
    this.entity.injectModel(this.selectedPicture ? this.selectedPicture : null, b.entity ? b.entity : this.initEntity(b));
    this.clonedEntities = [];
    Entry.stage.loadObject(this);
    for (a in this.pictures) {
      var d = this.pictures[a];
      d.id || (d.id = Entry.generateHash());
      var c = new Image;
      d.fileurl ? c.src = d.fileurl : d.fileurl ? c.src = d.fileurl : (b = d.filename, c.src = Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/image/" + b + ".png");
      c.onload = function(a) {
        Entry.container.cachePicture(d.id, c);
      };
    }
  }
};
Entry.EntryObject.prototype.generateView = function() {
  if ("workspace" == Entry.type) {
    var b = Entry.createElement("li", this.id);
    b.addClass("entryContainerListElementWorkspace");
    b.object = this;
    b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    });
    Entry.Utils.disableContextmenu(b);
    var a = this;
    $(b).on("contextmenu", function(b) {
      Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function(b) {
        b.stopPropagation();
        b = a;
        b.setLock(!1);
        b.editObjectValues(!0);
        b.nameView_.select();
      }}, {text:Lang.Workspace.context_duplicate, callback:function() {
        Entry.container.addCloneObject(a);
      }}, {text:Lang.Workspace.context_remove, callback:function() {
        Entry.container.removeObject(a);
      }}, {text:Lang.Workspace.copy_file, callback:function() {
        Entry.container.setCopiedObject(a);
      }}, {text:Lang.Blocks.Paste_blocks, callback:function() {
        Entry.container.copiedObject ? Entry.container.addCloneObject(Entry.container.copiedObject) : Entry.toast.alert(Lang.Workspace.add_object_alert, Lang.Workspace.object_not_found_for_paste);
      }}], "workspace-contextmenu");
    });
    this.view_ = b;
    var d = this, b = Entry.createElement("ul");
    b.addClass("objectInfoView");
    Entry.objectEditable || b.addClass("entryHide");
    var c = Entry.createElement("li");
    c.addClass("objectInfo_visible");
    this.entity.getVisible() || c.addClass("objectInfo_unvisible");
    c.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = d.entity, a.setVisible(!a.getVisible()) ? this.removeClass("objectInfo_unvisible") : this.addClass("objectInfo_unvisible"));
    });
    var e = Entry.createElement("li");
    e.addClass("objectInfo_unlock");
    this.getLock() && e.addClass("objectInfo_lock");
    e.bindOnClick(function(a) {
      Entry.engine.isState("run") || (a = d, a.setLock(!a.getLock()) ? this.addClass("objectInfo_lock") : this.removeClass("objectInfo_lock"), a.updateInputViews(a.getLock()));
    });
    b.appendChild(c);
    b.appendChild(e);
    this.view_.appendChild(b);
    b = Entry.createElement("div");
    b.addClass("entryObjectThumbnailWorkspace");
    this.view_.appendChild(b);
    this.thumbnailView_ = b;
    b = Entry.createElement("div");
    b.addClass("entryObjectWrapperWorkspace");
    this.view_.appendChild(b);
    c = Entry.createElement("input");
    c.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    c.addClass("entryObjectNameWorkspace");
    b.appendChild(c);
    this.nameView_ = c;
    this.nameView_.entryObject = this;
    c.setAttribute("readonly", !0);
    var f = this;
    this.nameView_.onblur = function(a) {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    };
    this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && f.editObjectValues(!1);
    };
    this.nameView_.value = this.name;
    c = Entry.createElement("div");
    c.addClass("entryObjectEditWorkspace");
    c.object = this;
    this.editView_ = c;
    this.view_.appendChild(c);
    Entry.objectEditable ? ($(c).mousedown(function(b) {
      var d = a.isEditing;
      b.stopPropagation();
      Entry.documentMousedown.notify(b);
      Entry.engine.isState("run") || !1 !== d || (a.editObjectValues(!d), Entry.playground.object !== a && Entry.container.selectObject(a.id), a.nameView_.select());
    }), c.blur = function(b) {
      a.editObjectComplete();
    }) : c.addClass("entryRemove");
    Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeleteWorkspace"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    }));
    c = Entry.createElement("div");
    c.addClass("entryObjectInformationWorkspace");
    c.object = this;
    this.isInformationToggle = !1;
    b.appendChild(c);
    this.informationView_ = c;
    b = Entry.createElement("div");
    b.addClass("entryObjectRotationWrapperWorkspace");
    b.object = this;
    this.view_.appendChild(b);
    c = Entry.createElement("span");
    c.addClass("entryObjectCoordinateWorkspace");
    b.appendChild(c);
    e = Entry.createElement("span");
    e.addClass("entryObjectCoordinateSpanWorkspace");
    e.innerHTML = "X:";
    var g = Entry.createElement("input");
    g.addClass("entryObjectCoordinateInputWorkspace");
    g.setAttribute("readonly", !0);
    g.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    var h = Entry.createElement("span");
    h.addClass("entryObjectCoordinateSpanWorkspace");
    h.innerHTML = "Y:";
    var k = Entry.createElement("input");
    k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right");
    k.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    k.setAttribute("readonly", !0);
    var l = Entry.createElement("span");
    l.addClass("entryObjectCoordinateSizeWorkspace");
    l.innerHTML = Lang.Workspace.Size + " : ";
    var n = Entry.createElement("input");
    n.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size");
    n.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    n.setAttribute("readonly", !0);
    c.appendChild(e);
    c.appendChild(g);
    c.appendChild(h);
    c.appendChild(k);
    c.appendChild(l);
    c.appendChild(n);
    c.xInput_ = g;
    c.yInput_ = k;
    c.sizeInput_ = n;
    this.coordinateView_ = c;
    d = this;
    g.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    g.onblur = function(a) {
      isNaN(g.value) || d.entity.setX(Number(g.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    k.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    k.onblur = function(a) {
      isNaN(k.value) || d.entity.setY(Number(k.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    n.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    n.onblur = function(a) {
      isNaN(n.value) || d.entity.setSize(Number(n.value));
      d.updateCoordinateView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("entryObjectRotateLabelWrapperWorkspace");
    this.view_.appendChild(c);
    this.rotateLabelWrapperView_ = c;
    e = Entry.createElement("span");
    e.addClass("entryObjectRotateSpanWorkspace");
    e.innerHTML = Lang.Workspace.rotation + " : ";
    var m = Entry.createElement("input");
    m.addClass("entryObjectRotateInputWorkspace");
    m.setAttribute("readonly", !0);
    m.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.rotateSpan_ = e;
    this.rotateInput_ = m;
    h = Entry.createElement("span");
    h.addClass("entryObjectDirectionSpanWorkspace");
    h.innerHTML = Lang.Workspace.direction + " : ";
    var q = Entry.createElement("input");
    q.addClass("entryObjectDirectionInputWorkspace");
    q.setAttribute("readonly", !0);
    q.bindOnClick(function(a) {
      a.stopPropagation();
      this.select();
    });
    this.directionInput_ = q;
    c.appendChild(e);
    c.appendChild(m);
    c.appendChild(h);
    c.appendChild(q);
    c.rotateInput_ = m;
    c.directionInput_ = q;
    d = this;
    m.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    m.onblur = function(a) {
      a = m.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || d.entity.setRotation(Number(a));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    q.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    };
    q.onblur = function(a) {
      a = q.value;
      -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da")));
      isNaN(a) || d.entity.setDirection(Number(a));
      d.updateRotationView();
      Entry.stage.updateObject();
    };
    c = Entry.createElement("div");
    c.addClass("rotationMethodWrapper");
    b.appendChild(c);
    this.rotationMethodWrapper_ = c;
    b = Entry.createElement("span");
    b.addClass("entryObjectRotateMethodLabelWorkspace");
    c.appendChild(b);
    b.innerHTML = Lang.Workspace.rotate_method + " : ";
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeAWorkspace");
    b.object = this;
    this.rotateModeAView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("free"), this.object.setRotateMethod("free"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeBWorkspace");
    b.object = this;
    this.rotateModeBView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("vertical"), this.object.setRotateMethod("vertical"));
    });
    b = Entry.createElement("div");
    b.addClass("entryObjectRotateModeWorkspace");
    b.addClass("entryObjectRotateModeCWorkspace");
    b.object = this;
    this.rotateModeCView_ = b;
    c.appendChild(b);
    b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.getLock() || (this.object.initRotateValue("none"), this.object.setRotateMethod("none"));
    });
    this.updateThumbnailView();
    this.updateCoordinateView();
    this.updateRotateMethodView();
    this.updateInputViews();
    this.updateCoordinateView(!0);
    this.updateRotationView(!0);
    return this.view_;
  }
  if ("phone" == Entry.type) {
    return b = Entry.createElement("li", this.id), b.addClass("entryContainerListElementWorkspace"), b.object = this, b.bindOnClick(function(a) {
      Entry.container.getObject(this.id) && Entry.container.selectObject(this.id);
    }), $ && (a = this, context.attach("#" + this.id, [{text:Lang.Workspace.context_rename, href:"/", action:function(a) {
      a.preventDefault();
    }}, {text:Lang.Workspace.context_duplicate, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.addCloneObject(a);
    }}, {text:Lang.Workspace.context_remove, href:"/", action:function(b) {
      b.preventDefault();
      Entry.container.removeObject(a);
    }}])), this.view_ = b, b = Entry.createElement("ul"), b.addClass("objectInfoView"), c = Entry.createElement("li"), c.addClass("objectInfo_visible"), e = Entry.createElement("li"), e.addClass("objectInfo_lock"), b.appendChild(c), b.appendChild(e), this.view_.appendChild(b), b = Entry.createElement("div"), b.addClass("entryObjectThumbnailWorkspace"), this.view_.appendChild(b), this.thumbnailView_ = b, b = Entry.createElement("div"), b.addClass("entryObjectWrapperWorkspace"), this.view_.appendChild(b), 
    c = Entry.createElement("input"), c.addClass("entryObjectNameWorkspace"), b.appendChild(c), this.nameView_ = c, this.nameView_.entryObject = this, this.nameView_.onblur = function() {
      this.entryObject.name = this.value;
      Entry.playground.reloadPlayground();
    }, this.nameView_.onkeypress = function(a) {
      13 == a.keyCode && d.editObjectValues(!1);
    }, this.nameView_.value = this.name, Entry.objectEditable && Entry.objectDeletable && (c = Entry.createElement("div"), c.addClass("entryObjectDeletePhone"), c.object = this, this.deleteView_ = c, this.view_.appendChild(c), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.container.removeObject(this.object);
    })), c = Entry.createElement("button"), c.addClass("entryObjectEditPhone"), c.object = this, c.bindOnClick(function(a) {
      if (a = Entry.container.getObject(this.id)) {
        Entry.container.selectObject(a.id), Entry.playground.injectObject(a);
      }
    }), this.view_.appendChild(c), c = Entry.createElement("div"), c.addClass("entryObjectInformationWorkspace"), c.object = this, this.isInformationToggle = !1, b.appendChild(c), this.informationView_ = c, c = Entry.createElement("div"), c.addClass("entryObjectRotateLabelWrapperWorkspace"), this.view_.appendChild(c), this.rotateLabelWrapperView_ = c, e = Entry.createElement("span"), e.addClass("entryObjectRotateSpanWorkspace"), e.innerHTML = Lang.Workspace.rotation + " : ", m = Entry.createElement("input"), 
    m.addClass("entryObjectRotateInputWorkspace"), this.rotateSpan_ = e, this.rotateInput_ = m, h = Entry.createElement("span"), h.addClass("entryObjectDirectionSpanWorkspace"), h.innerHTML = Lang.Workspace.direction + " : ", q = Entry.createElement("input"), q.addClass("entryObjectDirectionInputWorkspace"), this.directionInput_ = q, c.appendChild(e), c.appendChild(m), c.appendChild(h), c.appendChild(q), c.rotateInput_ = m, c.directionInput_ = q, d = this, m.onkeypress = function(a) {
      13 == a.keyCode && (a = m.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || d.entity.setRotation(Number(a)), d.updateRotationView(), m.blur());
    }, m.onblur = function(a) {
      d.entity.setRotation(d.entity.getRotation());
      Entry.stage.updateObject();
    }, q.onkeypress = function(a) {
      13 == a.keyCode && (a = q.value, -1 != a.indexOf("\u02da") && (a = a.substring(0, a.indexOf("\u02da"))), isNaN(a) || d.entity.setDirection(Number(a)), d.updateRotationView(), q.blur());
    }, q.onblur = function(a) {
      d.entity.setDirection(d.entity.getDirection());
      Entry.stage.updateObject();
    }, b = Entry.createElement("div"), b.addClass("entryObjectRotationWrapperWorkspace"), b.object = this, this.view_.appendChild(b), c = Entry.createElement("span"), c.addClass("entryObjectCoordinateWorkspace"), b.appendChild(c), e = Entry.createElement("span"), e.addClass("entryObjectCoordinateSpanWorkspace"), e.innerHTML = "X:", g = Entry.createElement("input"), g.addClass("entryObjectCoordinateInputWorkspace"), h = Entry.createElement("span"), h.addClass("entryObjectCoordinateSpanWorkspace"), 
    h.innerHTML = "Y:", k = Entry.createElement("input"), k.addClass("entryObjectCoordinateInputWorkspace entryObjectCoordinateInputWorkspace_right"), l = Entry.createElement("span"), l.addClass("entryObjectCoordinateSpanWorkspace"), l.innerHTML = Lang.Workspace.Size, n = Entry.createElement("input"), n.addClass("entryObjectCoordinateInputWorkspace", "entryObjectCoordinateInputWorkspace_size"), c.appendChild(e), c.appendChild(g), c.appendChild(h), c.appendChild(k), c.appendChild(l), c.appendChild(n), 
    c.xInput_ = g, c.yInput_ = k, c.sizeInput_ = n, this.coordinateView_ = c, d = this, g.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(g.value) || d.entity.setX(Number(g.value)), d.updateCoordinateView(), d.blur());
    }, g.onblur = function(a) {
      d.entity.setX(d.entity.getX());
      Entry.stage.updateObject();
    }, k.onkeypress = function(a) {
      13 == a.keyCode && (isNaN(k.value) || d.entity.setY(Number(k.value)), d.updateCoordinateView(), d.blur());
    }, k.onblur = function(a) {
      d.entity.setY(d.entity.getY());
      Entry.stage.updateObject();
    }, c = Entry.createElement("div"), c.addClass("rotationMethodWrapper"), b.appendChild(c), this.rotationMethodWrapper_ = c, b = Entry.createElement("span"), b.addClass("entryObjectRotateMethodLabelWorkspace"), c.appendChild(b), b.innerHTML = Lang.Workspace.rotate_method + " : ", b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeAWorkspace"), b.object = this, this.rotateModeAView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("free");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeBWorkspace"), b.object = this, this.rotateModeBView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("vertical");
    }), b = Entry.createElement("div"), b.addClass("entryObjectRotateModeWorkspace"), b.addClass("entryObjectRotateModeCWorkspace"), b.object = this, this.rotateModeCView_ = b, c.appendChild(b), b.bindOnClick(function(a) {
      Entry.engine.isState("run") || this.object.setRotateMethod("none");
    }), this.updateThumbnailView(), this.updateCoordinateView(), this.updateRotateMethodView(), this.updateInputViews(), this.view_;
  }
};
Entry.EntryObject.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "object name must be string");
  this.name = b;
  this.nameView_.value = b;
};
Entry.EntryObject.prototype.setText = function(b) {
  Entry.assert("string" == typeof b, "object text must be string");
  this.text = b;
};
Entry.EntryObject.prototype.setScript = function(b) {
  this.script = b;
};
Entry.EntryObject.prototype.getScriptText = function() {
  return JSON.stringify(this.script.toJSON());
};
Entry.EntryObject.prototype.initEntity = function(b) {
  var a = {};
  a.x = a.y = 0;
  a.rotation = 0;
  a.direction = 90;
  if ("sprite" == this.objectType) {
    var d = b.sprite.pictures[0].dimension;
    a.regX = d.width / 2;
    a.regY = d.height / 2;
    a.scaleX = a.scaleY = "background" == b.sprite.category.main ? Math.max(270 / d.height, 480 / d.width) : "new" == b.sprite.category.main ? 1 : 200 / (d.width + d.height);
    a.width = d.width;
    a.height = d.height;
  } else {
    if ("textBox" == this.objectType) {
      if (a.regX = 25, a.regY = 12, a.scaleX = a.scaleY = 1.5, a.width = 50, a.height = 24, a.text = b.text, b.options) {
        if (b = b.options, d = "", b.bold && (d += "bold "), b.italic && (d += "italic "), a.underline = b.underline, a.strike = b.strike, a.font = d + "20px " + b.font.family, a.colour = b.colour, a.bgColor = b.background, a.lineBreak = b.lineBreak) {
          a.width = 256, a.height = .5625 * a.width, a.regX = a.width / 2, a.regY = a.height / 2;
        }
      } else {
        a.underline = !1, a.strike = !1, a.font = "20px Nanum Gothic", a.colour = "#000000", a.bgColor = "#ffffff";
      }
    }
  }
  return a;
};
Entry.EntryObject.prototype.updateThumbnailView = function() {
  if ("sprite" == this.objectType) {
    if (this.entity.picture.fileurl) {
      this.thumbnailView_.style.backgroundImage = 'url("' + this.entity.picture.fileurl + '")';
    } else {
      var b = this.entity.picture.filename;
      this.thumbnailView_.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + b.substring(0, 2) + "/" + b.substring(2, 4) + "/thumb/" + b + '.png")';
    }
  } else {
    "textBox" == this.objectType && (this.thumbnailView_.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/text_icon.png") + ")");
  }
};
Entry.EntryObject.prototype.updateCoordinateView = function(b) {
  if ((this.isSelected() || b) && this.coordinateView_ && this.coordinateView_.xInput_ && this.coordinateView_.yInput_) {
    b = this.coordinateView_.xInput_.value;
    var a = this.coordinateView_.yInput_.value, d = this.coordinateView_.sizeInput_.value, c = this.entity.getX().toFixed(1), e = this.entity.getY().toFixed(1), f = this.entity.getSize().toFixed(1);
    b != c && (this.coordinateView_.xInput_.value = c);
    a != e && (this.coordinateView_.yInput_.value = e);
    d != f && (this.coordinateView_.sizeInput_.value = f);
  }
};
Entry.EntryObject.prototype.updateRotationView = function(b) {
  if (this.isSelected() && this.view_ || b) {
    b = "", "free" == this.getRotateMethod() ? (this.rotateSpan_.removeClass("entryRemove"), this.rotateInput_.removeClass("entryRemove"), b += this.entity.getRotation().toFixed(1), this.rotateInput_.value = b + "\u02da") : (this.rotateSpan_.addClass("entryRemove"), this.rotateInput_.addClass("entryRemove")), b = "" + this.entity.getDirection().toFixed(1), b += "\u02da", this.directionInput_.value = b;
  }
};
Entry.EntryObject.prototype.select = function(b) {
  console.log(this);
};
Entry.EntryObject.prototype.addPicture = function(b, a) {
  Entry.stateManager && Entry.stateManager.addCommand("add sprite", this, this.removePicture, b.id);
  a || 0 === a ? (this.pictures.splice(a, 0, b), Entry.playground.injectPicture(this)) : this.pictures.push(b);
  return new Entry.State(this, this.removePicture, b.id);
};
Entry.EntryObject.prototype.removePicture = function(b) {
  if (2 > this.pictures.length) {
    return !1;
  }
  b = this.getPicture(b);
  var a = this.pictures.indexOf(b);
  Entry.stateManager && Entry.stateManager.addCommand("remove sprite", this, this.addPicture, b, a);
  this.pictures.splice(a, 1);
  b === this.selectedPicture && Entry.playground.selectPicture(this.pictures[0]);
  Entry.playground.injectPicture(this);
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addPicture, b, a);
};
Entry.EntryObject.prototype.getPicture = function(b) {
  if (!b) {
    return this.selectedPicture;
  }
  b = b.trim();
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (a[c].name == b) {
      return a[c];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && d >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.setPicture = function(b) {
  for (var a in this.pictures) {
    if (b.id === this.pictures[a].id) {
      this.pictures[a] = b;
      return;
    }
  }
  throw Error("No picture found");
};
Entry.EntryObject.prototype.getPrevPicture = function(b) {
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[0 == c ? d - 1 : c - 1];
    }
  }
};
Entry.EntryObject.prototype.getNextPicture = function(b) {
  for (var a = this.pictures, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c == d - 1 ? 0 : c + 1];
    }
  }
};
Entry.EntryObject.prototype.selectPicture = function(b) {
  var a = this.getPicture(b);
  if (a) {
    this.selectedPicture = a, this.entity.setImage(a), this.updateThumbnailView();
  } else {
    throw Error("No picture with pictureId : " + b);
  }
};
Entry.EntryObject.prototype.addSound = function(b, a) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add sound", this, this.removeSound, b.id);
  Entry.initSound(b, a);
  a || 0 === a ? (this.sounds.splice(a, 0, b), Entry.playground.injectSound(this)) : this.sounds.push(b);
  return new Entry.State(this, this.removeSound, b.id);
};
Entry.EntryObject.prototype.removeSound = function(b) {
  var a;
  a = this.getSound(b);
  b = this.sounds.indexOf(a);
  Entry.stateManager && Entry.stateManager.addCommand("remove sound", this, this.addSound, a, b);
  this.sounds.splice(b, 1);
  Entry.playground.reloadPlayground();
  Entry.playground.injectSound(this);
  return new Entry.State(this, this.addSound, a, b);
};
Entry.EntryObject.prototype.getRotateMethod = function() {
  this.rotateMethod || (this.rotateMethod = "free");
  return this.rotateMethod;
};
Entry.EntryObject.prototype.setRotateMethod = function(b) {
  b || (b = "free");
  this.rotateMethod = b;
  this.updateRotateMethodView();
  Entry.stage.selectedObject && Entry.stage.selectedObject.entity && (Entry.stage.updateObject(), Entry.stage.updateHandle());
};
Entry.EntryObject.prototype.initRotateValue = function(b) {
  this.rotateMethod != b && (this.entity.rotation = 0, this.entity.direction = 90);
};
Entry.EntryObject.prototype.updateRotateMethodView = function() {
  var b = this.rotateMethod;
  this.rotateModeAView_ && (this.rotateModeAView_.removeClass("selected"), this.rotateModeBView_.removeClass("selected"), this.rotateModeCView_.removeClass("selected"), "free" == b ? this.rotateModeAView_.addClass("selected") : "vertical" == b ? this.rotateModeBView_.addClass("selected") : this.rotateModeCView_.addClass("selected"), this.updateRotationView());
};
Entry.EntryObject.prototype.toggleInformation = function(b) {
  this.setRotateMethod(this.getRotateMethod());
  void 0 === b && (b = this.isInformationToggle = !this.isInformationToggle);
  b ? this.view_.addClass("informationToggle") : this.view_.removeClass("informationToggle");
};
Entry.EntryObject.prototype.addCloneEntity = function(b, a, d) {
  this.clonedEntities.length > Entry.maxCloneLimit || (b = new Entry.EntityObject(this), a ? (b.injectModel(a.picture ? a.picture : null, a.toJSON()), b.snapshot_ = a.snapshot_, a.effect && (b.effect = Entry.cloneSimpleObject(a.effect), b.applyFilter()), a.brush && Entry.setCloneBrush(b, a.brush)) : (b.injectModel(this.entity.picture ? this.entity.picture : null, this.entity.toJSON(b)), b.snapshot_ = this.entity.snapshot_, this.entity.effect && (b.effect = Entry.cloneSimpleObject(this.entity.effect), 
  b.applyFilter()), this.entity.brush && Entry.setCloneBrush(b, this.entity.brush)), Entry.engine.raiseEventOnEntity(b, [b, "when_clone_start"]), b.isClone = !0, b.isStarted = !0, this.addCloneVariables(this, b, a ? a.variables : null, a ? a.lists : null), this.clonedEntities.push(b), Entry.stage.loadEntity(b));
};
Entry.EntryObject.prototype.initializeSplitter = function(b) {
  b.onmousedown = function(a) {
    Entry.container.disableSort();
    Entry.container.splitterEnable = !0;
  };
  document.addEventListener("mousemove", function(a) {
    Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.x || a.clientX});
  });
  document.addEventListener("mouseup", function(a) {
    Entry.container.splitterEnable = !1;
    Entry.container.enableSort();
  });
};
Entry.EntryObject.prototype.isSelected = function() {
  return this.isSelected_;
};
Entry.EntryObject.prototype.toJSON = function() {
  var b = {};
  b.id = this.id;
  b.name = this.name;
  "textBox" == this.objectType && (b.text = this.text);
  b.script = this.getScriptText();
  "sprite" == this.objectType && (b.selectedPictureId = this.selectedPicture.id);
  b.objectType = this.objectType;
  b.rotateMethod = this.getRotateMethod();
  b.scene = this.scene.id;
  b.sprite = {pictures:Entry.getPicturesJSON(this.pictures), sounds:Entry.getSoundsJSON(this.sounds)};
  b.lock = this.lock;
  b.entity = this.entity.toJSON();
  return b;
};
Entry.EntryObject.prototype.destroy = function() {
  Entry.stage.unloadEntity(this.entity);
  this.view_ && Entry.removeElement(this.view_);
};
Entry.EntryObject.prototype.getSound = function(b) {
  b = b.trim();
  for (var a = this.sounds, d = a.length, c = 0;c < d;c++) {
    if (a[c].id == b) {
      return a[c];
    }
  }
  for (c = 0;c < d;c++) {
    if (a[c].name == b) {
      return a[c];
    }
  }
  b = Entry.parseNumber(b);
  if ((!1 !== b || "boolean" != typeof b) && d >= b && 0 < b) {
    return a[b - 1];
  }
  throw Error("No Sound");
};
Entry.EntryObject.prototype.addCloneVariables = function(b, a, d, c) {
  a.variables = [];
  a.lists = [];
  d || (d = Entry.findObjsByKey(Entry.variableContainer.variables_, "object_", b.id));
  c || (c = Entry.findObjsByKey(Entry.variableContainer.lists_, "object_", b.id));
  for (b = 0;b < d.length;b++) {
    a.variables.push(d[b].clone());
  }
  for (b = 0;b < c.length;b++) {
    a.lists.push(c[b].clone());
  }
};
Entry.EntryObject.prototype.getLock = function() {
  return this.lock;
};
Entry.EntryObject.prototype.setLock = function(b) {
  return this.lock = b;
};
Entry.EntryObject.prototype.updateInputViews = function(b) {
  b = b || this.getLock();
  var a = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b && 1 != a[0].getAttribute("readonly")) {
    for (b = 0;b < a.length;b++) {
      a[b].removeClass("selectedEditingObject"), a[b].setAttribute("readonly", !1), this.isEditing = !1;
    }
  }
};
Entry.EntryObject.prototype.editObjectValues = function(b) {
  var a;
  a = this.getLock() ? [this.nameView_] : [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_];
  if (b) {
    $(a).removeClass("selectedNotEditingObject");
    for (b = 0;b < a.length;b++) {
      a[b].removeAttribute("readonly"), a[b].addClass("selectedEditingObject");
    }
    this.isEditing = !0;
  } else {
    for (b = 0;b < a.length;b++) {
      a[b].blur(!0);
    }
    this.blurAllInput();
    this.isEditing = !1;
  }
};
Entry.EntryObject.prototype.blurAllInput = function() {
  var b = document.getElementsByClassName("selectedEditingObject");
  $(b).removeClass("selectedEditingObject");
  for (var b = [this.nameView_, this.coordinateView_.xInput_, this.coordinateView_.yInput_, this.rotateInput_, this.directionInput_, this.coordinateView_.sizeInput_], a = 0;a < b.length;a++) {
    b[a].addClass("selectedNotEditingObject"), b[a].setAttribute("readonly", !0);
  }
};
Entry.EntryObject.prototype.addStampEntity = function(b) {
  b = new Entry.StampEntity(this, b);
  Entry.stage.loadEntity(b);
  this.clonedEntities.push(b);
  Entry.stage.sortZorder();
};
Entry.EntryObject.prototype.getClonedEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp || b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.getStampEntities = function() {
  var b = [];
  this.clonedEntities.map(function(a) {
    a.isStamp && b.push(a);
  });
  return b;
};
Entry.EntryObject.prototype.clearExecutor = function() {
  this.script.clearExecutors();
};
Entry.Painter = function() {
  this.toolbox = {selected:"cursor"};
  this.stroke = {enabled:!1, fillColor:"#000000", lineColor:"#000000", thickness:1, fill:!0, transparent:!1, style:"line", locked:!1};
  this.file = {id:Entry.generateHash(), name:"\uc0c8\uadf8\ub9bc", modified:!1, mode:"new"};
  this.font = {name:"KoPub Batang", size:20, style:"normal"};
  this.selectArea = {};
  this.firstStatement = !1;
};
Entry.Painter.prototype.initialize = function(b) {
  this.generateView(b);
  this.canvas = document.getElementById("entryPainterCanvas");
  this.canvas_ = document.getElementById("entryPainterCanvas_");
  this.stage = new createjs.Stage(this.canvas);
  this.stage.autoClear = !0;
  this.stage.enableDOMEvents(!0);
  this.stage.enableMouseOver(10);
  this.stage.mouseMoveOutside = !0;
  createjs.Touch.enable(this.stage);
  this.objectContainer = new createjs.Container;
  this.objectContainer.name = "container";
  this.stage.addChild(this.objectContainer);
  this.ctx = this.stage.canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = !1;
  this.ctx.webkitImageSmoothingEnabled = !1;
  this.ctx.mozImageSmoothingEnabled = !1;
  this.ctx.msImageSmoothingEnabled = !1;
  this.ctx.oImageSmoothingEnabled = !1;
  this.ctx_ = this.canvas_.getContext("2d");
  this.initDashedLine();
  this.initPicture();
  this.initCoordinator();
  this.initHandle();
  this.initDraw();
  var a = this;
  Entry.addEventListener("textUpdate", function() {
    var b = a.inputField.value();
    "" === b ? (a.inputField.hide(), delete a.inputField) : (a.inputField.hide(), a.drawText(b), a.selectToolbox("cursor"));
  });
  this.selectToolbox("cursor");
};
Entry.Painter.prototype.initHandle = function() {
  this._handle = new createjs.Container;
  this._handle.rect = new createjs.Shape;
  this._handle.addChild(this._handle.rect);
  var b = new createjs.Container;
  b.name = "move";
  b.width = 90;
  b.height = 90;
  b.x = 90;
  b.y = 90;
  b.rect = new createjs.Shape;
  var a = this;
  b.rect.on("mousedown", function(d) {
    "cursor" === a.toolbox.selected && (a.initCommand(), this.offset = {x:this.parent.x - this.x - d.stageX, y:this.parent.y - this.y - d.stageY}, this.parent.handleMode = "move", b.isSelectCenter = !1);
  });
  b.rect.on("pressmove", function(d) {
    "cursor" !== a.toolbox.selected || b.isSelectCenter || (a.doCommand(), this.parent.x = d.stageX + this.offset.x, this.parent.y = d.stageY + this.offset.y, a.updateImageHandle());
  });
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.rect.cursor = "move";
  b.addChild(b.rect);
  b.notch = new createjs.Shape;
  b.addChild(b.notch);
  b.NEHandle = this.generateCornerHandle();
  b.addChild(b.NEHandle);
  b.NWHandle = this.generateCornerHandle();
  b.addChild(b.NWHandle);
  b.SWHandle = this.generateCornerHandle();
  b.addChild(b.SWHandle);
  b.SEHandle = this.generateCornerHandle();
  b.addChild(b.SEHandle);
  b.EHandle = this.generateXHandle();
  b.addChild(b.EHandle);
  b.WHandle = this.generateXHandle();
  b.addChild(b.WHandle);
  b.NHandle = this.generateYHandle();
  b.addChild(b.NHandle);
  b.SHandle = this.generateYHandle();
  b.addChild(b.SHandle);
  b.RHandle = new createjs.Shape;
  b.RHandle.graphics.ss(2, 2, 0).beginFill("#888").s("#c1c7cd").f("#c1c7cd").dr(-2, -2, 8, 8);
  b.RHandle.on("mousedown", function(b) {
    a.initCommand();
  });
  b.RHandle.on("pressmove", function(b) {
    a.doCommand();
    var c = b.stageX - this.parent.x;
    b = b.stageY - this.parent.y;
    this.parent.rotation = 0 <= c ? Math.atan(b / c) / Math.PI * 180 + 90 : Math.atan(b / c) / Math.PI * 180 + 270;
    a.updateImageHandle();
  });
  b.RHandle.cursor = "crosshair";
  b.addChild(b.RHandle);
  b.on("mouseup", function(b) {
    a.checkCommand();
  });
  b.visible = !1;
  this.handle = b;
  this.stage.addChild(b);
  this.updateImageHandleCursor();
};
Entry.Painter.prototype.generateCornerHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.sqrt(Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x * (a.stageY - this.parent.y + this.parent.regY) / this.offset.y));
    10 < this.parent.width * c && 10 < this.parent.height * c && (this.parent.width *= c, this.parent.height *= c, this.offset = {x:a.stageX - this.parent.x + this.parent.regX, y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateXHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {x:a.stageX - this.parent.x + this.parent.regX};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.abs((a.stageX - this.parent.x + this.parent.regX) / this.offset.x);
    10 < this.parent.width * c && (this.parent.width *= c, this.offset = {x:a.stageX - this.parent.x + this.parent.regX});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.generateYHandle = function() {
  var b = this, a = new createjs.Shape;
  a.graphics.beginFill("#c1c7cd").ss(2, 2, 0).s("#c1c7cd").dr(-4, -4, 8, 8);
  a.on("mousedown", function(a) {
    b.initCommand();
    this.offset = {y:a.stageY - this.parent.y + this.parent.regY};
  });
  a.on("pressmove", function(a) {
    b.doCommand();
    var c = Math.abs((a.stageY - this.parent.y + this.parent.regY) / this.offset.y);
    10 < this.parent.height * c && (this.parent.height *= c, this.offset = {y:a.stageY - this.parent.y + this.parent.regY});
    b.updateImageHandle();
  });
  a.on("mouseup", function(a) {
    b.checkCommand();
  });
  return a;
};
Entry.Painter.prototype.updateImageHandle = function() {
  if (this.handle.visible) {
    var b = this.handle, a = b.direction, d = b.width, c = b.height, e = b.regX, f = b.regY;
    b.rect.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(-d / 2, -c / 2).lt(0, -c / 2).lt(0, -c / 2).lt(+d / 2, -c / 2).lt(+d / 2, +c / 2).lt(-d / 2, +c / 2).cp();
    b.notch.graphics.clear().f("rgba(0,0,1,0.01)").ss(2, 2, 0).s("#c1c7cd").lt(0, -c / 2).lt(0, -c / 2 - 20).cp();
    b.NEHandle.x = +b.width / 2;
    b.NEHandle.y = -b.height / 2;
    b.NWHandle.x = -b.width / 2;
    b.NWHandle.y = -b.height / 2;
    b.SWHandle.x = -b.width / 2;
    b.SWHandle.y = +b.height / 2;
    b.SEHandle.x = +b.width / 2;
    b.SEHandle.y = +b.height / 2;
    b.EHandle.x = +b.width / 2;
    b.EHandle.y = 0;
    b.WHandle.x = -b.width / 2;
    b.WHandle.y = 0;
    b.NHandle.x = 0;
    b.NHandle.y = -b.height / 2;
    b.SHandle.x = 0;
    b.SHandle.y = +b.height / 2;
    b.RHandle.x = -2;
    b.RHandle.y = -b.height / 2 - 20 - 2;
    this.handle.visible && (d = this.selectedObject, this.selectedObject.text ? (d.width = this.selectedObject.width, d.height = this.selectedObject.height) : (d.width = d.image.width, d.height = d.image.height), d.scaleX = b.width / d.width, d.scaleY = b.height / d.height, d.x = b.x, d.y = b.y, d.regX = d.width / 2 + e / d.scaleX, d.regY = d.height / 2 + f / d.scaleY, d.rotation = b.rotation, d.direction = a, this.selectArea.x1 = b.x - b.width / 2, this.selectArea.y1 = b.y - b.height / 2, this.selectArea.x2 = 
    b.width, this.selectArea.y2 = b.height, this.objectWidthInput.value = Math.abs(d.width * d.scaleX).toFixed(0), this.objectHeightInput.value = Math.abs(d.height * d.scaleY).toFixed(0), this.objectRotateInput.value = (1 * d.rotation).toFixed(0));
    this.updateImageHandleCursor();
    this.stage.update();
  }
};
Entry.Painter.prototype.updateImageHandleCursor = function() {
  var b = this.handle;
  b.rect.cursor = "move";
  b.RHandle.cursor = "crosshair";
  for (var a = ["nwse-resize", "ns-resize", "nesw-resize", "ew-resize"], d = Math.floor((b.rotation + 22.5) % 180 / 45), c = 0;c < d;c++) {
    a.push(a.shift());
  }
  b.NHandle.cursor = a[1];
  b.NEHandle.cursor = a[2];
  b.EHandle.cursor = a[3];
  b.SEHandle.cursor = a[0];
  b.SHandle.cursor = a[1];
  b.SWHandle.cursor = a[2];
  b.WHandle.cursor = a[3];
  b.NWHandle.cursor = a[0];
};
Entry.Painter.prototype.clearCanvas = function(b) {
  this.clearHandle();
  b || this.initCommand();
  this.objectContainer.removeAllChildren();
  this.stage.update();
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  b = 0;
  for (var a = this.colorLayerData.data.length;b < a;b++) {
    this.colorLayerData.data[b] = 255, this.colorLayerData.data[b + 1] = 255, this.colorLayerData.data[b + 2] = 255, this.colorLayerData.data[b + 3] = 255;
  }
  this.reloadContext();
};
Entry.Painter.prototype.newPicture = function() {
  var b = {dimension:{height:1, width:1}, fileurl:Entry.mediaFilePath + "_1x1.png", name:Lang.Workspace.new_picture};
  b.id = Entry.generateHash();
  Entry.playground.addPicture(b, !0);
};
Entry.Painter.prototype.initPicture = function() {
  var b = this;
  Entry.addEventListener("pictureSelected", function(a) {
    b.selectToolbox("cursor");
    if (b.file.id !== a.id) {
      b.file.modified && confirm("\uc218\uc815\ub41c \ub0b4\uc6a9\uc744 \uc800\uc7a5\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?") && (b.file_ = JSON.parse(JSON.stringify(b.file)), b.file_save(!0));
      b.file.modified = !1;
      b.clearCanvas(!0);
      var d = new Image;
      d.id = a.id ? a.id : Entry.generateHash();
      b.file.id = d.id;
      b.file.name = a.name;
      b.file.mode = "edit";
      d.src = a.fileurl ? a.fileurl : Entry.defaultPath + "/uploads/" + a.filename.substring(0, 2) + "/" + a.filename.substring(2, 4) + "/image/" + a.filename + ".png";
      d.onload = function(a) {
        b.addImage(a.target);
      };
    }
  });
  Entry.addEventListener("pictureImport", function(a) {
    b.addPicture(a);
  });
  Entry.addEventListener("pictureNameChanged", function(a) {
    b.file.name = a.name;
  });
  Entry.addEventListener("pictureClear", function(a) {
    b.file.modified = !1;
    b.file.id = "";
    b.file.name = "";
    b.clearCanvas();
  });
};
Entry.Painter.prototype.initDraw = function() {
  var b = this;
  this.stage.on("stagemousedown", function(a) {
    b.stagemousedown(a);
  });
  this.stage.on("stagemouseup", function(a) {
    b.stagemouseup(a);
  });
  this.stage.on("stagemousemove", function(a) {
    b.stagemousemove(a);
  });
};
Entry.Painter.prototype.selectObject = function(b, a) {
  this.selectedObject = b;
  this.handle.visible = b.visible;
  a ? (this.handle.width = this.copy.width, this.handle.height = this.copy.height, this.handle.x = this.selectArea.x1 + this.copy.width / 2, this.handle.y = this.selectArea.y1 + this.copy.height / 2) : (this.handle.width = b.scaleX * b.image.width, this.handle.height = b.scaleY * b.image.height, this.handle.x = b.x, this.handle.y = b.y, this.handle.regX = +(b.regX - b.image.width / 2) * b.scaleX, this.handle.regY = +(b.regY - b.image.height / 2) * b.scaleY);
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.selectTextObject = function(b) {
  this.selectedObject = b;
  var a = b.getTransformedBounds();
  this.handle.visible = b.visible;
  b.width || (this.selectedObject.width = a.width);
  b.height || (this.selectedObject.height = a.height);
  this.handle.width = b.scaleX * this.selectedObject.width;
  this.handle.height = b.scaleY * this.selectedObject.height;
  this.handle.x = b.x;
  this.handle.y = b.y;
  b.regX || (b.regX = b.width / 2);
  b.regY || (b.regY = b.height / 2);
  this.handle.regX = (b.regX - this.selectedObject.width / 2) * b.scaleX;
  this.handle.regY = (b.regY - this.selectedObject.height / 2) * b.scaleY;
  this.handle.rotation = b.rotation;
  this.handle.direction = 0;
  this.updateImageHandle();
};
Entry.Painter.prototype.updateHandle = function() {
  -1 < this.stage.getChildIndex(this._handle) && this.stage.removeChild(this._handle);
  -1 === this.stage.getChildIndex(this.handle) && this.stage.addChild(this.handle);
  var b = new createjs.Shape;
  b.graphics.clear().beginFill("#000").rect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.handle.rect.hitArea = b;
  this.handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#000000").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 4);
  this.stage.update();
};
Entry.Painter.prototype.updateHandle_ = function() {
  this.stage.getChildIndex(-1 < this._handle) && this.stage.addChild(this._handle);
  this._handle.rect.graphics.clear().setStrokeStyle(1, "round").beginStroke("#cccccc").drawDashedRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2, 2);
  this.stage.update();
};
Entry.Painter.prototype.matchTolerance = function(b, a, d, c, e) {
  var f = this.colorLayerData.data[b], g = this.colorLayerData.data[b + 1];
  b = this.colorLayerData.data[b + 2];
  return f >= a - e / 100 * a && f <= a + e / 100 * a && g >= d - e / 100 * d && g <= d + e / 100 * d && b >= c - e / 100 * c && b <= c + e / 100 * c;
};
Entry.Painter.prototype.matchColorOnly = function(b, a, d, c) {
  return a === this.colorLayerData.data[b] && d === this.colorLayerData.data[b + 1] && c === this.colorLayerData.data[b + 2] ? !0 : !1;
};
Entry.Painter.prototype.matchColor = function(b, a, d, c, e) {
  return a === this.colorLayerData.data[b] && d === this.colorLayerData.data[b + 1] && c === this.colorLayerData.data[b + 2] && e === this.colorLayerData.data[b + 3] ? !0 : !1;
};
Entry.Painter.prototype.colorPixel = function(b, a, d, c, e) {
  e || (e = 255);
  this.stroke.transparent && (e = c = d = a = 0);
  this.colorLayerData.data[b] = a;
  this.colorLayerData.data[b + 1] = d;
  this.colorLayerData.data[b + 2] = c;
  this.colorLayerData.data[b + 3] = e;
};
Entry.Painter.prototype.pickStrokeColor = function(b) {
  b = 4 * (Math.round(b.stageY) * this.canvas.width + Math.round(b.stageX));
  this.stroke.lineColor = Entry.rgb2hex(this.colorLayerData.data[b], this.colorLayerData.data[b + 1], this.colorLayerData.data[b + 2]);
  document.getElementById("entryPainterAttrCircle").style.backgroundColor = this.stroke.lineColor;
  document.getElementById("entryPainterAttrCircleInput").value = this.stroke.lineColor;
};
Entry.Painter.prototype.drawText = function(b) {
  var a = document.getElementById("entryPainterAttrFontStyle").value, d = document.getElementById("entryPainterAttrFontName").value, c = document.getElementById("entryPainterAttrFontSize").value;
  b = new createjs.Text(b, a + " " + c + 'px "' + d + '"', this.stroke.lineColor);
  b.textBaseline = "top";
  b.x = this.oldPt.x;
  b.y = this.oldPt.y;
  this.objectContainer.addChild(b);
  this.selectTextObject(b);
  this.file.modified = !0;
};
Entry.Painter.prototype.addImage = function(b) {
  var a = new createjs.Bitmap(b);
  this.objectContainer.addChild(a);
  a.x = this.stage.canvas.width / 2;
  a.y = this.stage.canvas.height / 2;
  a.regX = a.image.width / 2 | 0;
  a.regY = a.image.height / 2 | 0;
  if (540 < a.image.height) {
    var d = 540 / a.image.height;
    a.scaleX = d;
    a.scaleY = d;
  }
  a.name = b.id;
  a.id = b.id;
  this.selectObject(a);
  this.stage.update();
};
Entry.Painter.prototype.createBrush = function() {
  this.initCommand();
  this.brush = new createjs.Shape;
  this.objectContainer.addChild(this.brush);
  this.stage.update();
};
Entry.Painter.prototype.createEraser = function() {
  this.initCommand();
  this.eraser = new createjs.Shape;
  this.objectContainer.addChild(this.eraser);
  this.stage.update();
};
Entry.Painter.prototype.clearHandle = function() {
  this.handle.visible && (this.handle.visible = !1);
  this.coordinator.visible && (this.coordinator.visible = !1);
  this.stage.update();
};
Entry.Painter.prototype.initCommand = function() {
  var b = !1;
  this.handle.visible && (b = !0, this.handle.visible = !1);
  var a = !1;
  this.coordinator.visible && (a = !0, this.coordinator.visible = !1);
  (b || a) && this.stage.update();
  this.isCommandValid = !1;
  this.colorLayerModel = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  Entry.stateManager && this.firstStatement && Entry.stateManager.addCommand("edit sprite", this, this.restorePainter, this.colorLayerModel);
  this.firstStatement = !0;
  b && (this.handle.visible = !0);
  a && (this.coordinator.visible = !0);
  (b || a) && this.stage.update();
};
Entry.Painter.prototype.doCommand = function() {
  this.isCommandValid = !0;
};
Entry.Painter.prototype.checkCommand = function() {
  this.isCommandValid || Entry.dispatchEvent("cancelLastCommand");
};
Entry.Painter.prototype.restorePainter = function(b) {
  this.clearHandle();
  var a = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(b, 0, 0);
  b = new Image;
  b.src = this.canvas.toDataURL();
  var d = this;
  b.onload = function(a) {
    a = new createjs.Bitmap(a.target);
    d.objectContainer.removeAllChildren();
    d.objectContainer.addChild(a);
  };
  Entry.stateManager && Entry.stateManager.addCommand("restore sprite", this, this.restorePainter, a);
};
Entry.Painter.prototype.platten = function() {
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.reloadContext();
};
Entry.Painter.prototype.fill = function() {
  if (!this.stroke.locked) {
    this.stroke.locked = !0;
    this.initCommand();
    this.doCommand();
    this.clearHandle();
    var b = this.canvas.width, a = this.canvas.height;
    this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
    var d = new createjs.Point(this.stage.mouseX, this.stage.mouseY);
    d.x = Math.round(d.x);
    d.y = Math.round(d.y);
    for (var c = 4 * (d.y * b + d.x), e = this.colorLayerData.data[c], f = this.colorLayerData.data[c + 1], g = this.colorLayerData.data[c + 2], h = this.colorLayerData.data[c + 3], k, l, d = [[d.x, d.y]], n = Entry.hex2rgb(this.stroke.lineColor);d.length;) {
      for (var c = d.pop(), m = c[0], q = c[1], c = 4 * (q * b + m);0 <= q && this.matchColor(c, e, f, g, h);) {
        --q, c -= 4 * b;
      }
      c += 4 * b;
      q += 1;
      for (l = k = !1;q < a - 1 && this.matchColor(c, e, f, g, h);) {
        q += 1, this.colorPixel(c, n.r, n.g, n.b), 0 < m && (this.matchColor(c - 4, e, f, g, h) ? k || (d.push([m - 1, q]), k = !0) : k && (k = !1)), m < b - 1 && (this.matchColor(c + 4, e, f, g, h) ? l || (d.push([m + 1, q]), l = !0) : l && (l = !1)), c += 4 * b;
      }
      if (1080 < d.length) {
        break;
      }
    }
    this.file.modified = !0;
    this.reloadContext();
  }
};
Entry.Painter.prototype.reloadContext = function() {
  delete this.selectedObject;
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    a.stroke.locked = !1;
  };
};
Entry.Painter.prototype.move_pen = function() {
  var b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.brush.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke(this.stroke.lineColor).moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_line = function() {
  this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").moveTo(this.oldPt.x, this.oldPt.y).lineTo(this.stage.mouseX, this.stage.mouseY);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_rect = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawRect(this.oldPt.x, this.oldPt.y, b, a) : 0 === this.stroke.thickness ? this.brush.graphics.clear().setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawRect(this.oldPt.x, this.oldPt.y, b, a);
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.move_circle = function() {
  var b = this.stage.mouseX - this.oldPt.x, a = this.stage.mouseY - this.oldPt.y;
  event.shiftKey && (a = b);
  this.stroke.fill ? 0 === this.stroke.thickness ? this.brush.graphics.clear().beginStroke(this.stroke.fillColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").beginFill(this.stroke.fillColor).drawEllipse(this.oldPt.x, this.oldPt.y, b, a) : this.stroke.fill || (0 === this.stroke.thickness ? this.brush.graphics.clear().drawEllipse(this.oldPt.x, 
  this.oldPt.y, b, a) : this.brush.graphics.clear().beginStroke(this.stroke.lineColor).setStrokeStyle(this.stroke.thickness, "round").drawEllipse(this.oldPt.x, this.oldPt.y, b, a));
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.edit_copy = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0)) : alert("\ubcf5\uc0ac\ud560 \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_cut = function() {
  this.selectArea ? (this.clearHandle(), this.selectedObject && delete this.selectedObject, this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.copy = {}, this.copy.width = this.selectArea.x2, this.copy.height = this.selectArea.y2, this.canvas_.width = this.copy.width, this.canvas_.height = this.copy.height, this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height), this.ctx_.putImageData(this.copyLayerData, 0, 
  0), this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2), this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), this.reloadContext(), this.file.modified = !0) : alert("\uc790\ub97c \uc601\uc5ed\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
};
Entry.Painter.prototype.edit_paste = function() {
  var b = new Image;
  b.src = this.canvas_.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    b.x = a.canvas.width / 2;
    b.y = a.canvas.height / 2;
    b.regX = a.copy.width / 2 | 0;
    b.regY = a.copy.height / 2 | 0;
    b.id = Entry.generateHash();
    a.objectContainer.addChild(b);
    a.selectObject(b, !0);
  };
  this.file.modified = !0;
};
Entry.Painter.prototype.edit_select = function() {
  this.clearHandle();
  this.selectedObject && delete this.selectedObject;
  this.copyLayerData = this.ctx.getImageData(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.copy = {};
  this.copy.width = this.selectArea.x2;
  this.copy.height = this.selectArea.y2;
  this.canvas_.width = this.copy.width;
  this.canvas_.height = this.copy.height;
  this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
  this.ctx_.putImageData(this.copyLayerData, 0, 0);
  this.ctx.clearRect(this.selectArea.x1, this.selectArea.y1, this.selectArea.x2, this.selectArea.y2);
  this.colorLayerData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(this.colorLayerData, 0, 0);
  var b = new Image;
  b.src = this.canvas.toDataURL();
  var a = this;
  b.onload = function(b) {
    b = new createjs.Bitmap(b.target);
    a.objectContainer.removeAllChildren();
    a.objectContainer.addChild(b);
    b = new Image;
    b.src = a.canvas_.toDataURL();
    b.onload = function(b) {
      b = new createjs.Bitmap(b.target);
      b.x = a.selectArea.x1 + a.copy.width / 2;
      b.y = a.selectArea.y1 + a.copy.height / 2;
      b.regX = a.copy.width / 2 | 0;
      b.regY = a.copy.height / 2 | 0;
      b.id = Entry.generateHash();
      b.name = b.id;
      a.objectContainer.addChild(b);
      a.selectObject(b, !0);
    };
  };
};
Entry.Painter.prototype.move_erase = function(b) {
  b = new createjs.Point(this.oldPt.x + this.stage.mouseX >> 1, this.oldPt.y + this.stage.mouseY >> 1);
  this.eraser.graphics.setStrokeStyle(this.stroke.thickness, "round").beginStroke("#ffffff").moveTo(b.x, b.y).curveTo(this.oldPt.x, this.oldPt.y, this.oldMidPt.x, this.oldMidPt.y);
  this.oldPt.x = this.stage.mouseX;
  this.oldPt.y = this.stage.mouseY;
  this.oldMidPt.x = b.x;
  this.oldMidPt.y = b.y;
  this.file.modified = !0;
  this.stage.update();
};
Entry.Painter.prototype.settingShapeBlur = function() {
  this.objectWidthInput.blur();
  this.objectHeightInput.blur();
  this.objectRotateInput.blur();
};
Entry.Painter.prototype.stagemousedown = function(b) {
  "picture" == Entry.playground.getViewMode() && (this.settingShapeBlur(), this.oldPt = new createjs.Point(b.stageX, b.stageY), this.oldMidPt = this.oldPt.clone(), "select" === this.toolbox.selected ? this.stage.addChild(this._handle) : "spoid" === this.toolbox.selected ? this.pickStrokeColor(b) : "text" === this.toolbox.selected ? (this.showInputField(b), this.stage.update()) : "erase" === this.toolbox.selected ? (this.createEraser(), this.stroke.enabled = !0) : "fill" === this.toolbox.selected ? 
  this.fill() : "cursor" !== this.toolbox.selected && (this.createBrush(), this.stroke.enabled = !0));
};
Entry.Painter.prototype.stagemousemove = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected && -1 < this.stage.getChildIndex(this._handle) ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.updateHandle_()) : this.stroke.enabled && (this.doCommand(), "pen" === this.toolbox.selected ? this.move_pen(b) : "line" === this.toolbox.selected ? this.move_line(b) : "rect" === this.toolbox.selected ? 
  this.move_rect(b) : "circle" === this.toolbox.selected ? this.move_circle(b) : "erase" === this.toolbox.selected && this.move_erase(b)), this.painterTopStageXY.innerHTML = "x:" + b.stageX.toFixed(1) + ", y:" + b.stageY.toFixed(1));
};
Entry.Painter.prototype.stagemouseup = function(b) {
  "picture" == Entry.playground.getViewMode() && ("select" === this.toolbox.selected ? (this.selectArea.x1 = this.oldPt.x, this.selectArea.y1 = this.oldPt.y, this.selectArea.x2 = b.stageX - this.oldPt.x, this.selectArea.y2 = b.stageY - this.oldPt.y, this.stage.removeChild(this._handle), this.stage.update(), 0 < this.selectArea.x2 && 0 < this.selectArea.y2 && this.edit_select(), this.selectToolbox("cursor")) : "cursor" !== this.toolbox.selected && this.stroke.enabled && (-1 < this.objectContainer.getChildIndex(this.eraser) && 
  this.eraser.graphics.endStroke(), -1 < this.objectContainer.getChildIndex(this.brush) && this.brush.graphics.endStroke(), this.clearHandle(), this.platten(), this.stroke.enabled = !1, this.checkCommand()));
};
Entry.Painter.prototype.file_save = function(b) {
  this.clearHandle();
  this.transparent();
  this.trim();
  var a = this.canvas_.toDataURL();
  Entry.dispatchEvent("saveCanvasImage", {file:b ? this.file_ : this.file, image:a});
  this.file.modified = !1;
};
Entry.Painter.prototype.transparent = function() {
  var b = this.canvas.width, a = this.canvas.height;
  this.colorLayerData = this.ctx.getImageData(0, 0, b, a);
  var d = b * (a - 1) * 4, c = 4 * (b - 1), e = 4 * (b * a - 1);
  this.matchColorOnly(0, 255, 255, 255) ? this.fillTransparent(1, 1) : this.matchColorOnly(d, 255, 255, 255) ? this.fillTransparent(1, a) : this.matchColorOnly(c, 255, 255, 255) ? this.fillTransparent(b, 1) : this.matchColorOnly(e, 255, 255, 255) && this.fillTransparent(b, a);
};
Entry.Painter.prototype.fillTransparent = function(b, a) {
  this.stage.mouseX = b;
  this.stage.mouseY = a;
  this.stroke.transparent = !0;
  this.fill();
};
Entry.Painter.prototype.trim = function() {
  var b = this.canvas.width, a = this.ctx.getImageData(0, 0, b, this.canvas.height), d = a.data.length, c, e = null, f = null, g = null, h = null, k;
  for (c = 0;c < d;c += 4) {
    0 !== a.data[c + 3] && (g = c / 4 % b, k = ~~(c / 4 / b), null === e && (e = k), null === f ? f = g : g < f && (f = g), null === h ? h = k : h < k && (h = k));
  }
  b = h - e;
  a = g - f;
  d = null;
  0 === b || 0 === a ? (d = this.ctx.getImageData(0, 0, 1, 1), d.data[0] = 255, d.data[1] = 255, d.data[2] = 255, d.data[3] = 255, this.canvas_.width = 1, this.canvas_.height = 1) : (d = this.ctx.getImageData(f, e, a, b), this.canvas_.width = a, this.canvas_.height = b);
  this.ctx_.putImageData(d, 0, 0);
};
Entry.Painter.prototype.showInputField = function(b) {
  this.inputField ? (Entry.dispatchEvent("textUpdate"), delete this.inputField) : (this.initCommand(), this.doCommand(), this.inputField = new CanvasInput({canvas:document.getElementById("entryPainterCanvas"), fontSize:20, fontFamily:this.font.name, fontColor:"#000", width:650, padding:8, borderWidth:1, borderColor:"#000", borderRadius:3, boxShadow:"1px 1px 0px #fff", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:b.stageX, y:b.stageY, onsubmit:function() {
    Entry.dispatchEvent("textUpdate");
  }}), this.inputField.show());
};
Entry.Painter.prototype.addPicture = function(b) {
  this.initCommand();
  var a = new Image;
  a.id = Entry.generateHash();
  a.src = b.fileurl ? b.fileurl : Entry.defaultPath + "/uploads/" + b.filename.substring(0, 2) + "/" + b.filename.substring(2, 4) + "/image/" + b.filename + ".png";
  var d = this;
  a.onload = function(a) {
    d.addImage(a.target);
    d.selectToolbox("cursor");
  };
};
Entry.Painter.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "/workspace_coordinate.png");
  b.addChild(a);
  this.stage.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Painter.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
  this.stage.update();
};
Entry.Painter.prototype.initDashedLine = function() {
  createjs.Graphics.prototype.dashedLineTo = function(b, a, d, c, e) {
    this.moveTo(b, a);
    var f = d - b, g = c - a;
    e = Math.floor(Math.sqrt(f * f + g * g) / e);
    for (var f = f / e, g = g / e, h = 0;h++ < e;) {
      b += f, a += g, this[0 === h % 2 ? "moveTo" : "lineTo"](b, a);
    }
    this[0 === h % 2 ? "moveTo" : "lineTo"](d, c);
    return this;
  };
  createjs.Graphics.prototype.drawDashedRect = function(b, a, d, c, e) {
    this.moveTo(b, a);
    d = b + d;
    c = a + c;
    this.dashedLineTo(b, a, d, a, e);
    this.dashedLineTo(d, a, d, c, e);
    this.dashedLineTo(d, c, b, c, e);
    this.dashedLineTo(b, c, b, a, e);
    return this;
  };
  createjs.Graphics.prototype.drawResizableDashedRect = function(b, a, d, c, e, f) {
    this.moveTo(b, a);
    d = b + d;
    c = a + c;
    this.dashedLineTo(b + f, a, d - f, a, e);
    this.dashedLineTo(d, a + f, d, c - f, e);
    this.dashedLineTo(d - f, c, b + f, c, e);
    this.dashedLineTo(b, c - f, b, a + f, e);
    return this;
  };
};
Entry.Painter.prototype.generateView = function(b) {
  var a = this;
  this.view_ = b;
  if (!Entry.type || "workspace" == Entry.type) {
    this.view_.addClass("entryPainterWorkspace");
    var d = Entry.createElement("div", "entryPainterTop");
    d.addClass("entryPlaygroundPainterTop");
    this.view_.appendChild(d);
    var c = Entry.createElement("div", "entryPainterToolbox");
    c.addClass("entryPlaygroundPainterToolbox");
    this.view_.appendChild(c);
    var e = Entry.createElement("div", "entryPainterToolboxTop");
    e.addClass("entryPainterToolboxTop");
    c.appendChild(e);
    var f = Entry.createElement("div", "entryPainterContainer");
    f.addClass("entryPlaygroundPainterContainer");
    this.view_.appendChild(f);
    e = Entry.createElement("canvas", "entryPainterCanvas");
    e.width = 960;
    e.height = 540;
    e.addClass("entryPlaygroundPainterCanvas");
    f.appendChild(e);
    e = Entry.createElement("canvas", "entryPainterCanvas_");
    e.addClass("entryRemove");
    e.width = 960;
    e.height = 540;
    f.appendChild(e);
    var g = Entry.createElement("div", "entryPainterAttr");
    g.addClass("entryPlaygroundPainterAttr");
    this.view_.appendChild(g);
    this.flipObject = Entry.createElement("div", "entryPictureFlip");
    this.flipObject.addClass("entryPlaygroundPainterFlip");
    g.appendChild(this.flipObject);
    e = Entry.createElement("div", "entryPictureFlipX");
    e.title = "\uc88c\uc6b0\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleX *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipX");
    this.flipObject.appendChild(e);
    e = Entry.createElement("div", "entryPictureFlipY");
    e.title = "\uc0c1\ud558\ub4a4\uc9d1\uae30";
    e.bindOnClick(function() {
      a.selectedObject && (a.selectedObject.scaleY *= -1, a.selectedObject.text ? a.selectTextObject(a.selectedObject) : a.selectObject(a.selectedObject), a.updateImageHandle(), a.stage.update());
    });
    e.addClass("entryPlaygroundPainterFlipY");
    this.flipObject.appendChild(e);
    Entry.addEventListener("windowResized", function(a) {
      var d = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      a = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      var c = parseInt(document.getElementById("entryCanvas").style.width), d = d - (c + 240), c = a - 349;
      b.style.width = d + "px";
      f.style.width = d - 54 + "px";
      f.style.height = c + "px";
      g.style.top = c + 30 + "px";
      g.style.height = a - c + "px";
    });
    var h = Entry.createElement("nav", "entryPainterTopMenu");
    h.addClass("entryPlaygroundPainterTopMenu");
    d.appendChild(h);
    e = Entry.createElement("ul");
    h.appendChild(e);
    var k = Entry.createElement("li");
    h.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuFileNew");
    h.bindOnClick(function() {
      a.newPicture();
    });
    h.addClass("entryPlaygroundPainterTopMenuFileNew");
    h.innerHTML = Lang.Workspace.new_picture;
    k.appendChild(h);
    h = Entry.createElement("li", "entryPainterTopMenuFile");
    h.addClass("entryPlaygroundPainterTopMenuFile");
    h.innerHTML = Lang.Workspace.painter_file;
    e.appendChild(h);
    k = Entry.createElement("ul");
    h.appendChild(k);
    h = Entry.createElement("li");
    k.appendChild(h);
    var l = Entry.createElement("a", "entryPainterTopMenuFileSave");
    l.bindOnClick(function() {
      a.file_save(!1);
    });
    l.addClass("entryPainterTopMenuFileSave");
    l.innerHTML = Lang.Workspace.painter_file_save;
    h.appendChild(l);
    h = Entry.createElement("li");
    k.appendChild(h);
    k = Entry.createElement("a", "entryPainterTopMenuFileSaveAs");
    k.bindOnClick(function() {
      a.file.mode = "new";
      a.file_save(!1);
    });
    k.addClass("entryPlaygroundPainterTopMenuFileSaveAs");
    k.innerHTML = Lang.Workspace.painter_file_saveas;
    h.appendChild(k);
    k = Entry.createElement("li", "entryPainterTopMenuEdit");
    k.addClass("entryPlaygroundPainterTopMenuEdit");
    k.innerHTML = Lang.Workspace.painter_edit;
    e.appendChild(k);
    e = Entry.createElement("ul");
    k.appendChild(e);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditImportLink");
    h.bindOnClick(function() {
      Entry.dispatchEvent("openPictureImport");
    });
    h.addClass("entryPainterTopMenuEditImport");
    h.innerHTML = Lang.Workspace.get_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCopy");
    h.bindOnClick(function() {
      a.edit_copy();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCopy");
    h.innerHTML = Lang.Workspace.copy_file;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditCut");
    h.bindOnClick(function() {
      a.edit_cut();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditCut");
    h.innerHTML = Lang.Workspace.cut_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    h = Entry.createElement("a", "entryPainterTopMenuEditPaste");
    h.bindOnClick(function() {
      a.edit_paste();
    });
    h.addClass("entryPlaygroundPainterTopMenuEditPaste");
    h.innerHTML = Lang.Workspace.paste_picture;
    k.appendChild(h);
    k = Entry.createElement("li");
    e.appendChild(k);
    e = Entry.createElement("a", "entryPainterTopMenuEditEraseAll");
    e.addClass("entryPlaygroundPainterTopMenuEditEraseAll");
    e.innerHTML = Lang.Workspace.remove_all;
    e.bindOnClick(function() {
      a.clearCanvas();
    });
    k.appendChild(e);
    this.painterTopStageXY = e = Entry.createElement("div", "entryPainterTopStageXY");
    e.addClass("entryPlaygroundPainterTopStageXY");
    d.appendChild(e);
    e = Entry.createElement("ul", "entryPainterTopToolbar");
    e.addClass("entryPlaygroundPainterTopToolbar");
    d.appendChild(e);
    d = Entry.createElement("li", "entryPainterTopToolbarUndo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("li", "entryPainterTopToolbarRedo");
    d.bindOnClick(function() {
    });
    d.addClass("entryPlaygroundPainterTopToolbar");
    e.appendChild(d);
    d = Entry.createElement("ul");
    d.addClass("entryPlaygroundPainterToolboxContainer");
    c.appendChild(d);
    this.toolboxCursor = Entry.createElement("li", "entryPainterToolboxCursor");
    this.toolboxCursor.title = "\uc774\ub3d9";
    this.toolboxCursor.bindOnClick(function() {
      a.selectToolbox("cursor");
    });
    this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
    d.appendChild(this.toolboxCursor);
    this.toolboxSelect = Entry.createElement("li", "entryPainterToolboxSelect");
    this.toolboxSelect.title = "\uc790\ub974\uae30";
    this.toolboxSelect.bindOnClick(function() {
      a.selectToolbox("select");
    });
    this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
    d.appendChild(this.toolboxSelect);
    this.toolboxPen = Entry.createElement("li", "entryPainterToolboxPen");
    this.toolboxPen.title = "\ud39c";
    this.toolboxPen.bindOnClick(function() {
      a.selectToolbox("pen");
    });
    this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
    d.appendChild(this.toolboxPen);
    this.toolboxLine = Entry.createElement("li", "entryPainterToolboxLine");
    this.toolboxLine.title = "\uc9c1\uc120";
    this.toolboxLine.bindOnClick(function() {
      a.selectToolbox("line");
    });
    this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
    d.appendChild(this.toolboxLine);
    this.toolboxRect = Entry.createElement("li", "entryPainterToolboxRect");
    this.toolboxRect.title = "\uc0ac\uac01\ud615";
    this.toolboxRect.bindOnClick(function() {
      a.selectToolbox("rect");
    });
    this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
    d.appendChild(this.toolboxRect);
    this.toolboxCircle = Entry.createElement("li", "entryPainterToolboxCircle");
    this.toolboxCircle.title = "\uc6d0";
    this.toolboxCircle.bindOnClick(function() {
      a.selectToolbox("circle");
    });
    this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
    d.appendChild(this.toolboxCircle);
    this.toolboxText = Entry.createElement("li", "entryPainterToolboxText");
    this.toolboxText.title = "\uae00\uc0c1\uc790";
    this.toolboxText.bindOnClick(function() {
      a.selectToolbox("text");
    });
    this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
    d.appendChild(this.toolboxText);
    this.toolboxFill = Entry.createElement("li", "entryPainterToolboxFill");
    this.toolboxFill.bindOnClick(function() {
      a.selectToolbox("fill");
    });
    this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
    d.appendChild(this.toolboxFill);
    this.toolboxErase = Entry.createElement("li", "entryPainterToolboxErase");
    this.toolboxErase.title = "\uc9c0\uc6b0\uae30";
    this.toolboxErase.bindOnClick(function() {
      a.selectToolbox("erase");
    });
    this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
    d.appendChild(this.toolboxErase);
    c = Entry.createElement("li", "entryPainterToolboxCoordinate");
    c.title = "\uc88c\ud45c";
    c.bindOnClick(function() {
      a.toggleCoordinator();
    });
    c.addClass("entryPlaygroundPainterToolboxCoordinate");
    d.appendChild(c);
    this.attrResizeArea = Entry.createElement("fieldset", "painterAttrResize");
    this.attrResizeArea.addClass("entryPlaygroundPainterAttrResize");
    g.appendChild(this.attrResizeArea);
    c = Entry.createElement("legend");
    c.innerHTML = Lang.Workspace.picture_size;
    this.attrResizeArea.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrResizeX");
    this.attrResizeArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeXTop");
    d.innerHTML = "X";
    c.appendChild(d);
    this.objectWidthInput = Entry.createElement("input", "entryPainterAttrWidth");
    this.objectWidthInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.width = this.value;
      a.updateImageHandle();
    };
    this.objectWidthInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectWidthInput);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterSizeText");
    c.innerHTML = "x";
    this.attrResizeArea.appendChild(c);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundAttrReiszeY");
    this.attrResizeArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("entryPlaygroundPainterAttrResizeYTop");
    d.innerHTML = "Y";
    c.appendChild(d);
    this.objectHeightInput = Entry.createElement("input", "entryPainterAttrHeight");
    this.objectHeightInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      a.handle.height = this.value;
      a.updateImageHandle();
    };
    this.objectHeightInput.addClass("entryPlaygroundPainterNumberInput");
    c.appendChild(this.objectHeightInput);
    this.attrRotateArea = Entry.createElement("div", "painterAttrRotateArea");
    this.attrRotateArea.addClass("painterAttrRotateArea");
    g.appendChild(this.attrRotateArea);
    c = Entry.createElement("fieldset", "entryPainterAttrRotate");
    c.addClass("entryPlaygroundPainterAttrRotate");
    this.attrRotateArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateName");
    d.innerHTML = Lang.Workspace.picture_rotation;
    this.attrRotateArea.appendChild(d);
    d = Entry.createElement("div");
    d.addClass("painterAttrRotateTop");
    d.innerHTML = "\u03bf";
    c.appendChild(d);
    this.objectRotateInput = Entry.createElement("input", "entryPainterAttrDegree");
    this.objectRotateInput.onblur = function() {
      if (isNaN(this.value)) {
        return alert("\uc22b\uc790\ub9cc \uc785\ub825 \uac00\ub2a5\ud569\ub2c8\ub2e4."), !1;
      }
      360 <= this.value ? this.value %= 360 : 0 > this.value && (this.value = 360 + this.value % 360);
      a.handle.rotation = this.value;
      a.updateImageHandle();
    };
    this.objectRotateInput.addClass("entryPlaygroundPainterNumberInput");
    this.objectRotateInput.defaultValue = "0";
    c.appendChild(this.objectRotateInput);
    this.attrColorArea = Entry.createElement("fieldset", "entryPainterAttrColor");
    this.attrColorArea.addClass("entryPlaygroundPainterAttrColor");
    g.appendChild(this.attrColorArea);
    var n = Entry.createElement("div");
    n.addClass("entryPlaygroundPainterAttrColorContainer");
    this.attrColorArea.appendChild(n);
    this.attrCircleArea = Entry.createElement("div");
    this.attrCircleArea.addClass("painterAttrCircleArea");
    g.appendChild(this.attrCircleArea);
    c = Entry.createElement("div", "entryPainterAttrCircle");
    c.addClass("painterAttrCircle");
    this.attrCircleArea.appendChild(c);
    this.attrCircleArea.painterAttrCircle = c;
    c = Entry.createElement("input", "entryPainterAttrCircleInput");
    c.value = "#000000";
    c.addClass("painterAttrCircleInput");
    this.attrCircleArea.appendChild(c);
    this.attrColorSpoid = Entry.createElement("div");
    this.attrColorSpoid.bindOnClick(function() {
      a.selectToolbox("spoid");
    });
    this.attrColorSpoid.addClass("painterAttrColorSpoid");
    g.appendChild(this.attrColorSpoid);
    Entry.getColourCodes().forEach(function(b) {
      var d = Entry.createElement("div");
      d.addClass("entryPlaygroundPainterAttrColorElement");
      "transparent" === b ? d.style.backgroundImage = "url(" + (Entry.mediaFilePath + "/transparent.png") + ")" : d.style.backgroundColor = b;
      d.bindOnClick(function(d) {
        "transparent" === b ? (a.stroke.transparent = !0, a.stroke.lineColor = "#ffffff") : (a.stroke.transparent = !1, r && (document.getElementById("entryPainterShapeBackgroundColor").style.backgroundColor = b, a.stroke.fillColor = b), r || (document.getElementById("entryPainterShapeLineColor").style.backgroundColor = b, a.stroke.lineColor = b));
        document.getElementById("entryPainterAttrCircle").style.backgroundColor = a.stroke.lineColor;
        document.getElementById("entryPainterAttrCircleInput").value = b;
      });
      n.appendChild(d);
    });
    this.attrThickArea = Entry.createElement("div", "painterAttrThickArea");
    this.attrThickArea.addClass("entryPlaygroundentryPlaygroundPainterAttrThickArea");
    g.appendChild(this.attrThickArea);
    c = Entry.createElement("legend");
    c.addClass("painterAttrThickName");
    c.innerHTML = Lang.Workspace.thickness;
    this.attrThickArea.appendChild(c);
    var m = Entry.createElement("fieldset", "entryPainterAttrThick");
    m.addClass("entryPlaygroundPainterAttrThick");
    this.attrThickArea.appendChild(m);
    c = Entry.createElement("div");
    c.addClass("paintAttrThickTop");
    m.appendChild(c);
    e = Entry.createElement("select", "entryPainterAttrThick");
    e.addClass("entryPlaygroundPainterAttrThickInput");
    e.size = "1";
    e.onchange = function(b) {
      a.stroke.thickness = b.target.value;
    };
    for (c = 1;10 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, e.appendChild(d);
    }
    m.appendChild(e);
    c = Entry.createElement("div", "entryPainterShapeLineColor");
    c.addClass("painterAttrShapeLineColor");
    d = Entry.createElement("div", "entryPainterShapeInnerBackground");
    d.addClass("painterAttrShapeInnerBackground");
    c.appendChild(d);
    m.appendChild(c);
    this.attrThickArea.painterAttrShapeLineColor = c;
    m.bindOnClick(function() {
      q.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !1;
    });
    this.attrBackgroundArea = Entry.createElement("div", "painterAttrBackgroundArea");
    this.attrBackgroundArea.addClass("entryPlaygroundPainterBackgroundArea");
    g.appendChild(this.attrBackgroundArea);
    c = Entry.createElement("fieldset", "entryPainterAttrbackground");
    c.addClass("entryPlaygroundPainterAttrBackground");
    this.attrBackgroundArea.appendChild(c);
    d = Entry.createElement("div");
    d.addClass("paintAttrBackgroundTop");
    c.appendChild(d);
    var q = Entry.createElement("div", "entryPainterShapeBackgroundColor");
    q.addClass("painterAttrShapeBackgroundColor");
    this.attrBackgroundArea.painterAttrShapeBackgroundColor = q;
    d.appendChild(q);
    var r = !1;
    q.bindOnClick(function(a) {
      m.style.zIndex = "1";
      this.style.zIndex = "10";
      r = !0;
    });
    this.attrFontArea = Entry.createElement("div", "painterAttrFont");
    this.attrFontArea.addClass("entryPlaygroundPainterAttrFont");
    g.appendChild(this.attrFontArea);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrTop");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPaintAttrTop_");
    e.appendChild(c);
    c = Entry.createElement("legend");
    c.addClass("panterAttrFontTitle");
    c.innerHTML = Lang.Workspace.textStyle;
    k = Entry.createElement("select", "entryPainterAttrFontName");
    k.addClass("entryPlaygroundPainterAttrFontName");
    k.size = "1";
    k.onchange = function(b) {
      a.font.name = b.target.value;
    };
    for (c = 0;c < Entry.fonts.length;c++) {
      h = Entry.fonts[c], d = Entry.createElement("option"), d.value = h.family, d.innerHTML = h.name, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("painterAttrFontSizeArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("painterAttrFontSizeTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontSize");
    k.addClass("entryPlaygroundPainterAttrFontSize");
    k.size = "1";
    k.onchange = function(b) {
      a.font.size = b.target.value;
    };
    for (c = 20;72 >= c;c++) {
      d = Entry.createElement("option"), d.value = c, d.innerHTML = c, k.appendChild(d);
    }
    e.appendChild(k);
    e = Entry.createElement("div");
    e.addClass("entryPlaygroundPainterAttrFontStyleArea");
    this.attrFontArea.appendChild(e);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrFontTop");
    e.appendChild(c);
    k = Entry.createElement("select", "entryPainterAttrFontStyle");
    k.addClass("entryPlaygroundPainterAttrFontStyle");
    k.size = "1";
    k.onchange = function(b) {
      a.font.style = b.target.value;
    };
    h = [{label:"\ubcf4\ud1b5", value:"normal"}, {label:"\uad75\uac8c", value:"bold"}, {label:"\uae30\uc6b8\uc784", value:"italic"}];
    for (c = 0;c < h.length;c++) {
      l = h[c], d = Entry.createElement("option"), d.value = l.value, d.innerHTML = l.label, k.appendChild(d);
    }
    e.appendChild(k);
    this.attrLineArea = Entry.createElement("div", "painterAttrLineStyle");
    this.attrLineArea.addClass("entryPlaygroundPainterAttrLineStyle");
    g.appendChild(this.attrLineArea);
    var u = Entry.createElement("div");
    u.addClass("entryPlaygroundPainterAttrLineStyleLine");
    this.attrLineArea.appendChild(u);
    var t = Entry.createElement("div");
    t.addClass("entryPlaygroundPaitnerAttrLineArea");
    this.attrLineArea.appendChild(t);
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundPainterAttrLineStyleLine1");
    t.appendChild(c);
    c.value = "line";
    var v = Entry.createElement("div");
    v.addClass("painterAttrLineStyleBackgroundLine");
    u.bindOnClick(function(a) {
      t.removeClass("entryRemove");
    });
    t.blur = function(a) {
      this.addClass("entryRemove");
    };
    t.onmouseleave = function(a) {
      this.addClass("entryRemove");
    };
    c.bindOnClick(function(a) {
      this.attrLineArea.removeClass(u);
      this.attrLineArea.appendChild(v);
      this.attrLineArea.onchange(a);
      t.blur();
    });
    v.bindOnClick(function(a) {
      t.removeClass("entryRemove");
    });
    this.attrLineArea.onchange = function(b) {
      a.stroke.style = b.target.value;
    };
    t.blur();
  }
};
Entry.Painter.prototype.restoreHandle = function() {
  this.selectedObject && !1 === this.handle.visible && (this.handle.visible = !0, this.stage.update());
};
Entry.Painter.prototype.initDisplay = function() {
  this.stroke.enabled = !1;
  this.toolboxCursor.addClass("entryPlaygroundPainterToolboxCursor");
  this.toolboxCursor.removeClass("entryToolboxCursorClicked");
  this.toolboxSelect.addClass("entryPlaygroundPainterToolboxSelect");
  this.toolboxSelect.removeClass("entryToolboxSelectClicked");
  this.toolboxPen.addClass("entryPlaygroundPainterToolboxPen");
  this.toolboxPen.removeClass("entryToolboxPenClicked");
  this.toolboxLine.addClass("entryPlaygroundPainterToolboxLine");
  this.toolboxLine.removeClass("entryToolboxLineClicked");
  this.toolboxRect.addClass("entryPlaygroundPainterToolboxRect");
  this.toolboxRect.removeClass("entryToolboxRectClicked");
  this.toolboxCircle.addClass("entryPlaygroundPainterToolboxCircle");
  this.toolboxCircle.removeClass("entryToolBoxCircleClicked");
  this.toolboxText.addClass("entryPlaygroundPainterToolboxText");
  this.toolboxText.removeClass("entryToolBoxTextClicked");
  this.toolboxFill.addClass("entryPlaygroundPainterToolboxFill");
  this.toolboxFill.removeClass("entryToolBoxFillClicked");
  this.toolboxErase.addClass("entryPlaygroundPainterToolboxErase");
  this.toolboxErase.removeClass("entryToolBoxEraseClicked");
  this.attrColorSpoid.addClass("painterAttrColorSpoid");
  this.attrColorSpoid.removeClass("painterAttrColorSpoidClicked");
  this.attrResizeArea.addClass("entryRemove");
  this.attrRotateArea.addClass("entryRemove");
  this.attrThickArea.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrLineArea.addClass("entryRemove");
  this.attrColorArea.addClass("entryRemove");
  this.attrCircleArea.addClass("entryRemove");
  this.attrColorSpoid.addClass("entryRemove");
  this.attrFontArea.addClass("entryRemove");
  this.attrBackgroundArea.addClass("entryRemove");
  this.flipObject.addClass("entryRemove");
  this.attrThickArea.painterAttrShapeLineColor.addClass("entryRemove");
  this.attrBackgroundArea.painterAttrShapeBackgroundColor.addClass("entryRemove");
  this.attrCircleArea.painterAttrCircle.addClass("entryRemove");
  this.inputField && !this.inputField._isHidden && (this.inputField.hide(), this.stage.update());
};
Entry.Painter.prototype.selectToolbox = function(b) {
  this.toolbox.selected = b;
  "erase" != b && $(".entryPlaygroundPainterContainer").removeClass("dd");
  this.initDisplay();
  "cursor" !== b && this.clearHandle();
  "text" !== b && this.inputField && delete this.inputField;
  switch(b) {
    case "cursor":
      this.restoreHandle();
      this.toolboxCursor.addClass("entryToolboxCursorClicked");
      this.attrResizeArea.removeClass("entryRemove");
      this.attrRotateArea.removeClass("entryRemove");
      this.flipObject.removeClass("entryRemove");
      break;
    case "select":
      this.toolboxSelect.addClass("entryToolboxSelectClicked");
      break;
    case "pen":
      this.toolboxPen.addClass("entryToolboxPenClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "line":
      this.toolboxLine.addClass("entryToolboxLineClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      break;
    case "rect":
      this.toolboxRect.addClass("entryToolboxRectClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "circle":
      this.toolboxCircle.addClass("entryToolBoxCircleClicked");
      this.attrThickArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrThickArea.painterAttrShapeLineColor.removeClass("entryRemove");
      this.attrBackgroundArea.removeClass("entryRemove");
      this.attrBackgroundArea.painterAttrShapeBackgroundColor.removeClass("entryRemove");
      break;
    case "text":
      this.toolboxText.addClass("entryToolBoxTextClicked");
      this.attrFontArea.removeClass("entryRemove");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "fill":
      this.toolboxFill.addClass("entryToolBoxFillClicked");
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrCircleArea.painterAttrCircle.removeClass("entryRemove");
      break;
    case "erase":
      $(".entryPlaygroundPainterContainer").addClass("dd");
      this.toolboxErase.addClass("entryToolBoxEraseClicked");
      this.attrThickArea.removeClass("entryRemove");
      break;
    case "spoid":
      this.attrColorArea.removeClass("entryRemove");
      this.attrCircleArea.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("entryRemove");
      this.attrColorSpoid.removeClass("painterAttrColorSpoid");
      this.attrColorSpoid.addClass("painterAttrColorSpoidClicked");
      break;
    case "coordinate":
      this.toggleCoordinator();
  }
};
Entry.Pdf = function(b) {
  this.generateView(b);
};
p = Entry.Pdf.prototype;
p.generateView = function(b) {
  var a = Entry.createElement("div", "entryPdfWorkspace");
  a.addClass("entryHidden");
  this._view = a;
  var d = "/pdfjs/web/viewer.html";
  b && "" != b && (d += "?file=" + b);
  pdfViewIframe = Entry.createElement("iframe", "entryPdfIframeWorkspace");
  pdfViewIframe.setAttribute("id", "pdfViewIframe");
  pdfViewIframe.setAttribute("frameborder", 0);
  pdfViewIframe.setAttribute("src", d);
  a.appendChild(pdfViewIframe);
};
p.getView = function() {
  return this._view;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("pdfViewIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.Popup = function() {
  Entry.assert(!window.popup, "Popup exist");
  this.body_ = Entry.createElement("div");
  this.body_.addClass("entryPopup");
  this.body_.bindOnClick(function(b) {
    b.target == this && this.popup.remove();
  });
  this.body_.popup = this;
  document.body.appendChild(this.body_);
  this.window_ = Entry.createElement("div");
  this.window_.addClass("entryPopupWindow");
  this.window_.bindOnClick(function() {
  });
  Entry.addEventListener("windowResized", this.resize);
  window.popup = this;
  this.resize();
  this.body_.appendChild(this.window_);
};
Entry.Popup.prototype.remove = function() {
  for (;this.window_.hasChildNodes();) {
    "workspace" == Entry.type ? Entry.view_.insertBefore(this.window_.firstChild, Entry.container.view_) : Entry.view_.insertBefore(this.window_.lastChild, Entry.view_.firstChild);
  }
  $("body").css("overflow", "auto");
  Entry.removeElement(this.body_);
  window.popup = null;
  Entry.removeEventListener("windowResized", this.resize);
  Entry.engine.popup = null;
};
Entry.Popup.prototype.resize = function(b) {
  b = window.popup.window_;
  var a = .9 * window.innerWidth, d = .9 * window.innerHeight - 35;
  9 * a <= 16 * d ? d = a / 16 * 9 : a = 16 * d / 9;
  b.style.width = String(a) + "px";
  b.style.height = String(d + 35) + "px";
};
Entry.popupHelper = function(b) {
  this.popupList = {};
  this.nowContent;
  b && (window.popupHelper = null);
  Entry.assert(!window.popupHelper, "Popup exist");
  var a = ["confirm", "spinner"], d = ["entryPopupHelperTopSpan", "entryPopupHelperBottomSpan", "entryPopupHelperLeftSpan", "entryPopupHelperRightSpan"];
  this.body_ = Entry.Dom("div", {classes:["entryPopup", "hiddenPopup", "popupHelper"]});
  var c = this;
  this.body_.bindOnClick(function(b) {
    if (!(c.nowContent && -1 < a.indexOf(c.nowContent.prop("type")))) {
      var f = $(b.target);
      d.forEach(function(a) {
        f.hasClass(a) && this.popup.hide();
      }.bind(this));
      b.target == this && this.popup.hide();
    }
  });
  window.popupHelper = this;
  this.body_.prop("popup", this);
  Entry.Dom("div", {class:"entryPopupHelperTopSpan", parent:this.body_});
  b = Entry.Dom("div", {class:"entryPopupHelperMiddleSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperBottomSpan", parent:this.body_});
  Entry.Dom("div", {class:"entryPopupHelperLeftSpan", parent:b});
  this.window_ = Entry.Dom("div", {class:"entryPopupHelperWindow", parent:b});
  Entry.Dom("div", {class:"entryPopupHelperRightSpan", parent:b});
  $("body").append(this.body_);
};
Entry.popupHelper.prototype.clearPopup = function() {
  for (var b = this.popupWrapper_.children.length - 1;2 < b;b--) {
    this.popupWrapper_.removeChild(this.popupWrapper_.children[b]);
  }
};
Entry.popupHelper.prototype.addPopup = function(b, a) {
  var d = Entry.Dom("div"), c = Entry.Dom("div", {class:"entryPopupHelperCloseButton"});
  c.bindOnClick(function() {
    a.closeEvent ? a.closeEvent(this) : this.hide();
  }.bind(this));
  var e = Entry.Dom("div", {class:"entryPopupHelperWrapper"});
  e.append(c);
  a.title && (c = Entry.Dom("div", {class:"entryPopupHelperTitle"}), e.append(c), c.text(a.title));
  d.addClass(b);
  d.append(e);
  d.popupWrapper_ = e;
  d.prop("type", a.type);
  "function" === typeof a.setPopupLayout && a.setPopupLayout(d);
  this.popupList[b] = d;
};
Entry.popupHelper.prototype.hasPopup = function(b) {
  return !!this.popupList[b];
};
Entry.popupHelper.prototype.setPopup = function(b) {
};
Entry.popupHelper.prototype.remove = function(b) {
  0 < this.window_.children().length && this.window_.children().remove();
  this.window_.remove();
  delete this.popupList[b];
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.popupHelper.prototype.resize = function(b) {
};
Entry.popupHelper.prototype.show = function(b) {
  0 < this.window_.children().length && this.window_.children().detach();
  this.window_.append(this.popupList[b]);
  this.nowContent = this.popupList[b];
  this.body_.removeClass("hiddenPopup");
};
Entry.popupHelper.prototype.hide = function() {
  this.nowContent = void 0;
  this.body_.addClass("hiddenPopup");
};
Entry.getStartProject = function(b) {
  return {category:"\uae30\ud0c0", scenes:[{name:"\uc7a5\uba74 1", id:"7dwq"}], variables:[{name:"\ucd08\uc2dc\uacc4", id:"brih", visible:!1, value:"0", variableType:"timer", x:150, y:-70, array:[], object:null, isCloud:!1}, {name:"\ub300\ub2f5", id:"1vu8", visible:!1, value:"0", variableType:"answer", x:150, y:-100, array:[], object:null, isCloud:!1}], objects:[{id:"7y0y", name:"\uc5d4\ud2b8\ub9ac\ubd07", script:[[{type:"when_run_button_click", x:40, y:50}, {type:"repeat_basic", statements:[[{type:"move_direction"}]]}]], 
  selectedPictureId:"vx80", objectType:"sprite", rotateMethod:"free", scene:"7dwq", sprite:{sounds:[{duration:1.3, ext:".mp3", id:"8el5", fileurl:b + "media/bark.mp3", name:"\uac15\uc544\uc9c0 \uc9d6\ub294\uc18c\ub9ac"}], pictures:[{id:"vx80", fileurl:b + "media/entrybot1.png", name:Lang.Blocks.walking_entryBot + "1", scale:100, dimension:{width:284, height:350}}, {id:"4t48", fileurl:b + "media/entrybot2.png", name:Lang.Blocks.walking_entryBot + "2", scale:100, dimension:{width:284, height:350}}]}, 
  entity:{x:0, y:0, regX:142, regY:175, scaleX:.3154574132492113, scaleY:.3154574132492113, rotation:0, direction:90, width:284, height:350, visible:!0}, lock:!1, active:!0}], speed:60};
};
Entry.PropertyPanel = function() {
  this.modes = {};
  this.selected = null;
};
(function(b) {
  b.generateView = function(a, b) {
    this._view = Entry.Dom("div", {class:"propertyPanel", parent:$(a)});
    this._tabView = Entry.Dom("div", {class:"propertyTab", parent:this._view});
    this._contentView = Entry.Dom("div", {class:"propertyContent", parent:this._view});
    var c = Entry.createElement("div");
    c.addClass("entryObjectSelectedImgWorkspace");
    this.selectedImgView_ = c;
    this._view.append(c);
    this.initializeSplitter(c);
    this.splitter = c;
  };
  b.addMode = function(a, b) {
    var c = b.getView(), c = Entry.Dom(c, {parent:this._contentView}), e = Entry.Dom("<div>" + Lang.Menus[a] + "</div>", {classes:["propertyTabElement", "propertyTab" + a], parent:this._tabView}), f = this;
    e.bind("click", function() {
      f.select(a);
    });
    this.modes[a] && (this.modes[a].tabDom.remove(), this.modes[a].contentDom.remove(), "hw" == a && ($(this.modes).removeClass(".propertyTabhw"), $(".propertyTabhw").unbind("dblclick")));
    this.modes[a] = {obj:b, tabDom:e, contentDom:c};
    "hw" == a && $(".propertyTabhw").bind("dblclick", function() {
      Entry.dispatchEvent("hwModeChange");
    });
  };
  b.resize = function(a) {
    this._view.css({width:a + "px", top:9 * a / 16 + 123 - 22 + "px"});
    430 <= a ? this._view.removeClass("collapsed") : this._view.addClass("collapsed");
    Entry.dispatchEvent("windowResized");
    (a = this.modes[this.selected].obj.resize) && "hw" != this.selected ? a() : "hw" == this.selected && this.modes.hw.obj.listPorts ? this.modes[this.selected].obj.resizeList() : "hw" == this.selected && this.modes[this.selected].obj.resize();
  };
  b.select = function(a) {
    for (var b in this.modes) {
      var c = this.modes[b];
      c.tabDom.removeClass("selected");
      c.contentDom.addClass("entryRemove");
      c.obj.visible = !1;
    }
    b = this.modes[a];
    b.tabDom.addClass("selected");
    b.contentDom.removeClass("entryRemove");
    b.obj.resize && b.obj.resize();
    b.obj.visible = !0;
    this.selected = a;
  };
  b.initializeSplitter = function(a) {
    a.onmousedown = function(a) {
      Entry.container.disableSort();
      Entry.container.splitterEnable = !0;
      Entry.documentMousemove && (Entry.container.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
        Entry.container.splitterEnable && Entry.resizeElement({canvasWidth:a.clientX || a.x});
      }));
    };
    document.addEventListener("mouseup", function(a) {
      if (a = Entry.container.resizeEvent) {
        Entry.container.splitterEnable = !1, Entry.documentMousemove.detach(a), delete Entry.container.resizeEvent;
      }
      Entry.container.enableSort();
    });
  };
})(Entry.PropertyPanel.prototype);
Entry.init = function(b, a) {
  Entry.assert("object" === typeof a, "Init option is not object");
  this.events_ = {};
  this.interfaceState = {menuWidth:264};
  Entry.Utils.bindGlobalEvent("resize mousedown mousemove keydown keyup dispose".split(" "));
  this.options = a;
  this.parseOptions(a);
  this.mediaFilePath = (a.libDir ? a.libDir : "/lib") + "/entryjs/images/";
  this.defaultPath = a.defaultDir || "";
  this.blockInjectPath = a.blockInjectDir || "";
  "workspace" == this.type && this.isPhone() && (this.type = "phone");
  this.initialize_();
  this.view_ = b;
  this.view_.setAttribute("class", "entry");
  Entry.initFonts(a.fonts);
  this.createDom(b, this.type);
  this.loadInterfaceState();
  this.overridePrototype();
  this.maxCloneLimit = 302;
  this.cloudSavable = !0;
  this.startTime = (new Date).getTime();
  document.onkeydown = function(a) {
    Entry.dispatchEvent("keyPressed", a);
  };
  document.onkeyup = function(a) {
    Entry.dispatchEvent("keyUpped", a);
  };
  window.onresize = function(a) {
    Entry.dispatchEvent("windowResized", a);
  };
  window.onbeforeunload = this.beforeUnload;
  Entry.addEventListener("saveWorkspace", function(a) {
    Entry.addActivity("save");
  });
  "IE" != Entry.getBrowserType().substr(0, 2) || window.flashaudio ? createjs.Sound.registerPlugins([createjs.WebAudioPlugin]) : (createjs.FlashAudioPlugin.swfPath = this.mediaFilePath + "media/", createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]), window.flashaudio = !0);
  Entry.soundQueue = new createjs.LoadQueue;
  Entry.soundQueue.installPlugin(createjs.Sound);
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/click.mp3", Entry.mediaFilePath + "sounds/click.wav", Entry.mediaFilePath + "sounds/click.ogg"], "entryMagneting");
  Entry.loadAudio_([Entry.mediaFilePath + "sounds/delete.mp3", Entry.mediaFilePath + "sounds/delete.ogg", Entry.mediaFilePath + "sounds/delete.wav"], "entryDelete");
  createjs.Sound.stop();
};
Entry.loadAudio_ = function(b, a) {
  if (window.Audio && b.length) {
    for (;0 < b.length;) {
      var d = b[0];
      d.match(/\/([^.]+)./);
      Entry.soundQueue.loadFile({id:a, src:d, type:createjs.LoadQueue.SOUND});
      break;
    }
  }
};
Entry.initialize_ = function() {
  this.stage = new Entry.Stage;
  Entry.engine && Entry.engine.clearTimer();
  this.engine = new Entry.Engine;
  this.propertyPanel = new Entry.PropertyPanel;
  this.container = new Entry.Container;
  this.helper = new Entry.Helper;
  this.youtube = new Entry.Youtube;
  this.variableContainer = new Entry.VariableContainer;
  this.commander = new Entry.Commander(this.type);
  this.scene = new Entry.Scene;
  this.playground = new Entry.Playground;
  this.toast = new Entry.Toast;
  this.hw && this.hw.closeConnection();
  this.hw = new Entry.HW;
  if (Entry.enableActivityLogging) {
    this.reporter = new Entry.Reporter(!1);
  } else {
    if ("workspace" == this.type || "phone" == this.type) {
      this.reporter = new Entry.Reporter(!0);
    }
  }
};
Entry.createDom = function(b, a) {
  if (a && "workspace" != a) {
    "minimize" == a ? (d = Entry.createElement("canvas"), d.className = "entryCanvasWorkspace", d.id = "entryCanvas", d.width = 640, d.height = 360, c = Entry.createElement("div", "entryCanvasWrapper"), c.appendChild(d), b.appendChild(c), this.canvas_ = d, this.stage.initStage(this.canvas_), c = Entry.createElement("div"), b.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, a)) : "phone" == a && (this.stateManagerView = d = Entry.createElement("div"), this.stateManager.generateView(this.stateManagerView, 
    a), c = Entry.createElement("div"), b.appendChild(c), this.engineView = c, this.engine.generateView(this.engineView, a), d = Entry.createElement("canvas"), d.addClass("entryCanvasPhone"), d.id = "entryCanvas", d.width = 640, d.height = 360, c.insertBefore(d, this.engine.footerView_), this.canvas_ = d, this.stage.initStage(this.canvas_), d = Entry.createElement("div"), b.appendChild(d), this.containerView = d, this.container.generateView(this.containerView, a), d = Entry.createElement("div"), 
    b.appendChild(d), this.playgroundView = d, this.playground.generateView(this.playgroundView, a));
  } else {
    Entry.documentMousedown.attach(this, this.cancelObjectEdit);
    var d = Entry.createElement("div");
    b.appendChild(d);
    this.sceneView = d;
    this.scene.generateView(this.sceneView, a);
    d = Entry.createElement("div");
    this.sceneView.appendChild(d);
    this.stateManagerView = d;
    this.stateManager.generateView(this.stateManagerView, a);
    var c = Entry.createElement("div");
    b.appendChild(c);
    this.engineView = c;
    this.engine.generateView(this.engineView, a);
    d = Entry.createElement("canvas");
    d.addClass("entryCanvasWorkspace");
    d.id = "entryCanvas";
    d.width = 640;
    d.height = 360;
    c.insertBefore(d, this.engine.addButton);
    d.addEventListener("mousewheel", function(a) {
      var b = Entry.variableContainer.getListById(Entry.stage.mouseCoordinate);
      a = 0 < a.wheelDelta ? !0 : !1;
      for (var d = 0;d < b.length;d++) {
        var c = b[d];
        c.scrollButton_.y = a ? 46 <= c.scrollButton_.y ? c.scrollButton_.y - 23 : 23 : c.scrollButton_.y + 23;
        c.updateView();
      }
    });
    this.canvas_ = d;
    this.stage.initStage(this.canvas_);
    d = Entry.createElement("div");
    this.propertyPanel.generateView(b, a);
    this.containerView = d;
    this.container.generateView(this.containerView, a);
    this.propertyPanel.addMode("object", this.container);
    this.helper.generateView(this.containerView, a);
    this.propertyPanel.addMode("helper", this.helper);
    d = Entry.createElement("div");
    b.appendChild(d);
    this.playgroundView = d;
    this.playground.generateView(this.playgroundView, a);
    this.propertyPanel.select("object");
    this.helper.bindWorkspace(this.playground.mainWorkspace);
  }
};
Entry.start = function(b) {
  this.FPS || (this.FPS = 60);
  Entry.assert("number" == typeof this.FPS, "FPS must be number");
  Entry.engine.start(this.FPS);
};
Entry.parseOptions = function(b) {
  this.type = b.type;
  this.projectSaveable = b.projectsaveable;
  void 0 === this.projectSaveable && (this.projectSaveable = !0);
  this.objectAddable = b.objectaddable;
  void 0 === this.objectAddable && (this.objectAddable = !0);
  this.objectEditable = b.objectEditable;
  void 0 === this.objectEditable && (this.objectEditable = !0);
  this.objectEditable || (this.objectAddable = !1);
  this.objectDeletable = b.objectdeletable;
  void 0 === this.objectDeletable && (this.objectDeletable = !0);
  this.soundEditable = b.soundeditable;
  void 0 === this.soundEditable && (this.soundEditable = !0);
  this.pictureEditable = b.pictureeditable;
  void 0 === this.pictureEditable && (this.pictureEditable = !0);
  this.sceneEditable = b.sceneEditable;
  void 0 === this.sceneEditable && (this.sceneEditable = !0);
  this.functionEnable = b.functionEnable;
  void 0 === this.functionEnable && (this.functionEnable = !0);
  this.messageEnable = b.messageEnable;
  void 0 === this.messageEnable && (this.messageEnable = !0);
  this.variableEnable = b.variableEnable;
  void 0 === this.variableEnable && (this.variableEnable = !0);
  this.listEnable = b.listEnable;
  void 0 === this.listEnable && (this.listEnable = !0);
  this.hasVariableManager = b.hasvariablemanager;
  this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable ? void 0 === this.hasVariableManager && (this.hasVariableManager = !0) : this.hasVariableManager = !1;
  this.isForLecture = b.isForLecture;
};
Entry.initFonts = function(b) {
  this.fonts = b;
  b || (this.fonts = []);
};
Entry.Reporter = function(b) {
  this.projectId = this.userId = null;
  this.isRealTime = b;
  this.activities = [];
};
Entry.Reporter.prototype.start = function(b, a, d) {
  this.isRealTime && (-1 < window.location.href.indexOf("localhost") ? this.io = io("localhost:7000") : this.io = io("play04.play-entry.com:7000"), this.io.emit("activity", {message:"start", userId:a, projectId:b, time:d}));
  this.userId = a;
  this.projectId = b;
};
Entry.Reporter.prototype.report = function(b) {
  if (!this.isRealTime || this.io) {
    var a = [], d;
    for (d in b.params) {
      var c = b.params[d];
      "object" !== typeof c ? a.push(c) : c.id && a.push(c.id);
    }
    b = {message:b.message, userId:this.userId, projectId:this.projectId, time:b.time, params:a};
    this.isRealTime ? this.io.emit("activity", b) : this.activities.push(b);
  }
};
Entry.Scene = function() {
  var b = this;
  this.scenes_ = [];
  this.selectedScene = null;
  this.maxCount = 20;
  $(window).on("resize", function(a) {
    b.resize();
  });
};
Entry.Scene.viewBasicWidth = 70;
Entry.Scene.prototype.generateView = function(b, a) {
  var d = this;
  this.view_ = b;
  this.view_.addClass("entryScene");
  if (!a || "workspace" == a) {
    this.view_.addClass("entrySceneWorkspace");
    $(this.view_).on("mousedown", function(a) {
      var b = $(this).offset(), c = $(window), h = a.pageX - b.left + c.scrollLeft();
      a = a.pageY - b.top + c.scrollTop();
      a = 40 - a;
      b = -40 / 55;
      c = $(d.selectedScene.view).find(".entrySceneRemoveButtonCoverWorkspace").offset().left;
      !(h < c || h > c + 55) && a > 40 + b * (h - c) && (h = d.getNextScene()) && (h = $(h.view), $(document).trigger("mouseup"), h.trigger("mousedown"));
    });
    var c = Entry.createElement("ul");
    c.addClass("entrySceneListWorkspace");
    Entry.sceneEditable && $ && $(c).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
      $(b.item[0]).clone(!0);
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), c = b.item.index();
      Entry.scene.moveScene(d, c);
    }, axis:"x", tolerance:"pointer"});
    this.view_.appendChild(c);
    this.listView_ = c;
    Entry.sceneEditable && (c = Entry.createElement("span"), c.addClass("entrySceneElementWorkspace"), c.addClass("entrySceneAddButtonWorkspace"), c.bindOnClick(function(a) {
      Entry.engine.isState("run") || Entry.scene.addScene();
    }), this.view_.appendChild(c), this.addButton_ = c);
  }
};
Entry.Scene.prototype.generateElement = function(b) {
  var a = this, d = Entry.createElement("li", b.id);
  d.addClass("entrySceneElementWorkspace");
  d.addClass("entrySceneButtonWorkspace");
  d.addClass("minValue");
  $(d).on("mousedown", function(a) {
    Entry.engine.isState("run") ? a.preventDefault() : Entry.scene.selectScene(b);
  });
  var c = Entry.createElement("input");
  c.addClass("entrySceneFieldWorkspace");
  c.value = b.name;
  Entry.sceneEditable || (c.disabled = "disabled");
  var e = Entry.createElement("span");
  e.addClass("entrySceneLeftWorkspace");
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entrySceneInputCover");
  f.style.width = Entry.computeInputWidth(b.name);
  d.appendChild(f);
  b.inputWrapper = f;
  c.onkeyup = function(d) {
    d = d.keyCode;
    Entry.isArrowOrBackspace(d) || (b.name = this.value, f.style.width = Entry.computeInputWidth(b.name), a.resize(), 13 == d && this.blur(), 9 < this.value.length && (this.value = this.value.substring(0, 10), this.blur()));
  };
  c.onblur = function(a) {
    c.value = this.value;
    b.name = this.value;
    f.style.width = Entry.computeInputWidth(b.name);
  };
  f.appendChild(c);
  e = Entry.createElement("span");
  e.addClass("entrySceneRemoveButtonCoverWorkspace");
  d.appendChild(e);
  if (Entry.sceneEditable) {
    var g = Entry.createElement("button");
    g.addClass("entrySceneRemoveButtonWorkspace");
    g.innerHTML = "x";
    g.scene = b;
    g.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.engine.isState("run") || confirm(Lang.Workspace.will_you_delete_scene) && Entry.scene.removeScene(this.scene);
    });
    e.appendChild(g);
  }
  Entry.Utils.disableContextmenu(d);
  $(d).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.duplicate_scene, callback:function() {
      Entry.scene.cloneScene(b);
    }}], "workspace-contextmenu");
  });
  return b.view = d;
};
Entry.Scene.prototype.updateView = function() {
  if (!Entry.type || "workspace" == Entry.type) {
    for (var b = this.listView_;b.hasChildNodes();) {
      b.lastChild.removeClass("selectedScene"), b.removeChild(b.lastChild);
    }
    for (var a in this.getScenes()) {
      var d = this.scenes_[a];
      b.appendChild(d.view);
      this.selectedScene.id == d.id && d.view.addClass("selectedScene");
    }
    this.addButton_ && (this.getScenes().length < this.maxCount ? this.addButton_.removeClass("entryRemove") : this.addButton_.addClass("entryRemove"));
  }
  this.resize();
};
Entry.Scene.prototype.addScenes = function(b) {
  if ((this.scenes_ = b) && 0 !== b.length) {
    for (var a = 0, d = b.length;a < d;a++) {
      this.generateElement(b[a]);
    }
  } else {
    this.scenes_ = [], this.scenes_.push(this.createScene());
  }
  this.selectScene(this.getScenes()[0]);
  this.updateView();
};
Entry.Scene.prototype.addScene = function(b, a) {
  void 0 === b && (b = this.createScene());
  b.view || this.generateElement(b);
  a || "number" == typeof a ? this.getScenes().splice(a, 0, b) : this.getScenes().push(b);
  Entry.stage.objectContainers.push(Entry.stage.createObjectContainer(b));
  Entry.playground.flushPlayground();
  this.selectScene(b);
  this.updateView();
  return b;
};
Entry.Scene.prototype.removeScene = function(b) {
  if (1 >= this.getScenes().length) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, !1);
  } else {
    var a = this.getScenes().indexOf(this.getSceneById(b.id));
    this.getScenes().splice(a, 1);
    this.selectScene();
    for (var a = Entry.container.getSceneObjects(b), d = 0;d < a.length;d++) {
      Entry.container.removeObject(a[d]);
    }
    Entry.stage.removeObjectContainer(b);
    this.updateView();
  }
};
Entry.Scene.prototype.selectScene = function(b) {
  b = b || this.getScenes()[0];
  this.selectedScene && this.selectedScene.id == b.id || (Entry.engine.isState("run") && Entry.container.resetSceneDuringRun(), this.selectedScene = b, Entry.container.setCurrentObjects(), Entry.stage.objectContainers && 0 !== Entry.stage.objectContainers.length && Entry.stage.selectObjectContainer(b), (b = Entry.container.getCurrentObjects()[0]) && "minimize" != Entry.type ? (Entry.container.selectObject(b.id), Entry.playground.refreshPlayground()) : (Entry.stage.selectObject(null), Entry.playground.flushPlayground(), 
  Entry.variableContainer.updateList()), Entry.container.listView_ || Entry.stage.sortZorder(), Entry.container.updateListView(), this.updateView());
};
Entry.Scene.prototype.toJSON = function() {
  for (var b = [], a = this.getScenes().length, d = 0;d < a;d++) {
    var c = this.getScenes()[d], e = c.view, f = c.inputWrapper;
    delete c.view;
    delete c.inputWrapper;
    b.push(JSON.parse(JSON.stringify(c)));
    c.view = e;
    c.inputWrapper = f;
  }
  return b;
};
Entry.Scene.prototype.moveScene = function(b, a) {
  this.getScenes().splice(a, 0, this.getScenes().splice(b, 1)[0]);
  Entry.container.updateObjectsOrder();
  Entry.stage.sortZorder();
};
Entry.Scene.prototype.getSceneById = function(b) {
  for (var a = this.getScenes(), d = 0;d < a.length;d++) {
    if (a[d].id == b) {
      return a[d];
    }
  }
  return !1;
};
Entry.Scene.prototype.getScenes = function() {
  return this.scenes_;
};
Entry.Scene.prototype.takeStartSceneSnapshot = function() {
  this.sceneBeforeRun = this.selectedScene;
};
Entry.Scene.prototype.loadStartSceneSnapshot = function() {
  this.selectScene(this.sceneBeforeRun);
  this.sceneBeforeRun = null;
};
Entry.Scene.prototype.createScene = function() {
  var b = {name:Lang.Blocks.SCENE + " " + (this.getScenes().length + 1), id:Entry.generateHash()};
  this.generateElement(b);
  return b;
};
Entry.Scene.prototype.cloneScene = function(b) {
  if (this.scenes_.length >= this.maxCount) {
    Entry.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, !1);
  } else {
    var a = {name:b.name + Lang.Workspace.replica_of_object, id:Entry.generateHash()};
    this.generateElement(a);
    this.addScene(a);
    b = Entry.container.getSceneObjects(b);
    for (var d = b.length - 1;0 <= d;d--) {
      Entry.container.addCloneObject(b[d], a.id);
    }
  }
};
Entry.Scene.prototype.resize = function() {
  var b = this.getScenes(), a = this.selectedScene, d = b[0];
  if (0 !== b.length && d) {
    var c = $(d.view).offset().left, d = parseFloat($(a.view).css("margin-left")), e = $(this.view_).width() - c, f = 0, g;
    for (g in b) {
      var c = b[g], h = c.view;
      h.addClass("minValue");
      $(h).removeProp("style");
      $(c.inputWrapper).width(Entry.computeInputWidth(c.name));
      h = $(h);
      f = f + h.width() + d;
    }
    if (f > e) {
      for (g in e -= $(a.view).width(), d = e / (b.length - 1) - (Entry.Scene.viewBasicWidth + d), b) {
        c = b[g], a.id != c.id ? (c.view.removeClass("minValue"), $(c.inputWrapper).width(d)) : c.view.addClass("minValue");
      }
    }
  }
};
Entry.Scene.prototype.getNextScene = function() {
  var b = this.getScenes();
  return b[b.indexOf(this.selectedScene) + 1];
};
Entry.Script = function(b) {
  this.entity = b;
};
p = Entry.Script.prototype;
p.init = function(b, a, d) {
  Entry.assert("BLOCK" == b.tagName.toUpperCase(), b.tagName);
  this.type = b.getAttribute("type");
  this.id = Number(b.getAttribute("id"));
  b.getElementsByTagName("mutation").length && b.getElementsByTagName("mutation")[0].hasAttribute("hashid") && (this.hashId = b.childNodes[0].getAttribute("hashid"));
  "REPEAT" == this.type.substr(0, 6).toUpperCase() && (this.isRepeat = !0);
  a instanceof Entry.Script && (this.previousScript = a, a.parentScript && (this.parentScript = a.parentScript));
  d instanceof Entry.Script && (this.parentScript = d);
  b = b.childNodes;
  for (a = 0;a < b.length;a++) {
    if (d = b[a], "NEXT" == d.tagName.toUpperCase()) {
      this.nextScript = new Entry.Script(this.entity), this.register && (this.nextScript.register = this.register), this.nextScript.init(b[a].childNodes[0], this);
    } else {
      if ("VALUE" == d.tagName.toUpperCase()) {
        this.values || (this.values = {});
        var c = new Entry.Script(this.entity);
        this.register && (c.register = this.register);
        c.init(d.childNodes[0]);
        this.values[d.getAttribute("name")] = c;
      } else {
        "FIELD" == d.tagName.toUpperCase() ? (this.fields || (this.fields = {}), this.fields[d.getAttribute("name")] = d.textContent) : "STATEMENT" == d.tagName.toUpperCase() && (this.statements || (this.statements = {}), c = new Entry.Script(this.entity), this.register && (c.register = this.register), c.init(d.childNodes[0], null, this), c.key = d.getAttribute("name"), this.statements[d.getAttribute("name")] = c);
      }
    }
  }
};
p.clone = function(b, a) {
  var d = new Entry.Script(b);
  d.id = this.id;
  d.type = this.type;
  d.isRepeat = this.isRepeat;
  if (this.parentScript && !this.previousScript && 2 != a) {
    d.parentScript = this.parentScript.clone(b);
    for (var c = d.parentScript.statements[this.key] = d;c.nextScript;) {
      c = c.nextScript, c.parentScript = d.parentScript;
    }
  }
  this.nextScript && 1 != a && (d.nextScript = this.nextScript.clone(b, 0), d.nextScript.previousScript = this);
  this.previousScript && 0 !== a && (d.previousScript = this.previousScript.clone(b, 1), d.previousScript.previousScript = this);
  if (this.fields) {
    d.fields = {};
    for (var e in this.fields) {
      d.fields[e] = this.fields[e];
    }
  }
  if (this.values) {
    for (e in d.values = {}, this.values) {
      d.values[e] = this.values[e].clone(b);
    }
  }
  if (this.statements) {
    for (e in d.statements = {}, this.statements) {
      for (d.statements[e] = this.statements[e].clone(b, 2), c = d.statements[e], c.parentScript = d;c.nextScript;) {
        c = c.nextScript, c.parentScript = d;
      }
    }
  }
  return d;
};
p.getStatement = function(b) {
  return this.statements[b];
};
p.compute = function() {
};
p.getValue = function(b) {
  return this.values[b].run();
};
p.getNumberValue = function(b) {
  return Number(this.values[b].run());
};
p.getStringValue = function(b) {
  return String(this.values[b].run());
};
p.getBooleanValue = function(b) {
  return this.values[b].run() ? !0 : !1;
};
p.getField = function(b) {
  return this.fields[b];
};
p.getStringField = function(b) {
  return String(this.fields[b]);
};
p.getNumberField = function(b) {
  return Number(this.fields[b]);
};
p.callReturn = function() {
  return this.nextScript ? this.nextScript : this.parentScript ? this.parentScript : null;
};
p.run = function() {
  return Entry.block[this.type](this.entity, this);
};
Entry.Stage = function() {
  this.variables = {};
  this.background = new createjs.Shape;
  this.background.graphics.beginFill("#ffffff").drawRect(-480, -240, 960, 480);
  this.objectContainers = [];
  this.selectedObjectContainer = null;
  this.variableContainer = new createjs.Container;
  this.dialogContainer = new createjs.Container;
  this.selectedObject = null;
  this.isObjectClick = !1;
};
Entry.Stage.prototype.initStage = function(b) {
  this.canvas = new createjs.Stage(b.id);
  this.canvas.x = 320;
  this.canvas.y = 180;
  this.canvas.scaleX = this.canvas.scaleY = 2 / 1.5;
  createjs.Touch.enable(this.canvas);
  this.canvas.enableMouseOver(10);
  this.canvas.mouseMoveOutside = !0;
  this.canvas.addChild(this.background);
  this.canvas.addChild(this.variableContainer);
  this.canvas.addChild(this.dialogContainer);
  this.inputField = null;
  this.initCoordinator();
  this.initHandle();
  this.mouseCoordinate = {x:0, y:0};
  if (Entry.isPhone()) {
    b.ontouchstart = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    }, b.ontouchend = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
  } else {
    var a = function(a) {
      Entry.dispatchEvent("canvasClick", a);
      Entry.stage.isClick = !0;
    };
    b.onmousedown = a;
    b.ontouchstart = a;
    a = function(a) {
      Entry.stage.isClick = !1;
      Entry.dispatchEvent("canvasClickCanceled", a);
    };
    b.onmouseup = a;
    b.ontouchend = a;
    $(document).click(function(a) {
      Entry.stage.focused = "entryCanvas" === a.target.id ? !0 : !1;
    });
  }
  Entry.addEventListener("canvasClick", function(a) {
    Entry.stage.isObjectClick = !1;
  });
  a = function(a) {
    a.preventDefault();
    var b = this.getBoundingClientRect(), e;
    -1 < Entry.getBrowserType().indexOf("IE") ? (e = 480 * ((a.pageX - b.left - document.documentElement.scrollLeft) / b.width - .5), a = -270 * ((a.pageY - b.top - document.documentElement.scrollTop) / b.height - .5)) : a.changedTouches ? (e = 480 * ((a.changedTouches[0].pageX - b.left - document.body.scrollLeft) / b.width - .5), a = -270 * ((a.changedTouches[0].pageY - b.top - document.body.scrollTop) / b.height - .5)) : (e = 480 * ((a.pageX - b.left - document.body.scrollLeft) / b.width - .5), 
    a = -270 * ((a.pageY - b.top - document.body.scrollTop) / b.height - .5));
    Entry.stage.mouseCoordinate = {x:e.toFixed(1), y:a.toFixed(1)};
    Entry.dispatchEvent("stageMouseMove");
  };
  b.onmousemove = a;
  b.ontouchmove = a;
  b.onmouseout = function(a) {
    Entry.dispatchEvent("stageMouseOut");
  };
  Entry.addEventListener("updateObject", function(a) {
    Entry.engine.isState("stop") && Entry.stage.updateObject();
  });
  Entry.addEventListener("canvasInputComplete", function(a) {
    try {
      var b = Entry.stage.inputField.value();
      Entry.stage.hideInputField();
      if (b) {
        var e = Entry.container;
        e.setInputValue(b);
        e.inputValue.complete = !0;
      }
    } catch (f) {
    }
  });
  this.initWall();
  this.render();
};
Entry.Stage.prototype.render = function() {
  Entry.stage.timer && clearTimeout(Entry.stage.timer);
  var b = (new Date).getTime();
  Entry.stage.update();
  b = (new Date).getTime() - b;
  Entry.stage.timer = setTimeout(Entry.stage.render, 16 - b % 16 + 16 * Math.floor(b / 16));
};
Entry.Stage.prototype.update = function() {
  Entry.engine.isState("stop") && this.objectUpdated ? (this.canvas.update(), this.objectUpdated = !1) : this.canvas.update();
  this.inputField && !this.inputField._isHidden && this.inputField.render();
};
Entry.Stage.prototype.loadObject = function(b) {
  var a = b.entity.object;
  this.getObjectContainerByScene(b.scene).addChild(a);
  this.canvas.update();
};
Entry.Stage.prototype.loadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).addChild(b.object);
  this.sortZorder();
};
Entry.Stage.prototype.unloadEntity = function(b) {
  Entry.stage.getObjectContainerByScene(b.parent.scene).removeChild(b.object);
};
Entry.Stage.prototype.loadVariable = function(b) {
  var a = b.view_;
  this.variables[b.id] = a;
  this.variableContainer.addChild(a);
  this.canvas.update();
};
Entry.Stage.prototype.removeVariable = function(b) {
  this.variableContainer.removeChild(b.view_);
  this.canvas.update();
};
Entry.Stage.prototype.loadDialog = function(b) {
  this.dialogContainer.addChild(b.object);
};
Entry.Stage.prototype.unloadDialog = function(b) {
  this.dialogContainer.removeChild(b.object);
};
Entry.Stage.prototype.sortZorder = function() {
  for (var b = Entry.container.getCurrentObjects(), a = this.selectedObjectContainer, d = 0, c = b.length - 1;0 <= c;c--) {
    for (var e = b[c], f = e.entity, e = e.clonedEntities, g = 0, h = e.length;g < h;g++) {
      e[g].shape && a.setChildIndex(e[g].shape, d++), a.setChildIndex(e[g].object, d++);
    }
    f.shape && a.setChildIndex(f.shape, d++);
    a.setChildIndex(f.object, d++);
  }
};
Entry.Stage.prototype.initCoordinator = function() {
  var b = new createjs.Container, a = new createjs.Bitmap(Entry.mediaFilePath + "workspace_coordinate.png");
  a.scaleX = .5;
  a.scaleY = .5;
  a.x = -240;
  a.y = -135;
  b.addChild(a);
  this.canvas.addChild(b);
  b.visible = !1;
  this.coordinator = b;
};
Entry.Stage.prototype.toggleCoordinator = function() {
  this.coordinator.visible = !this.coordinator.visible;
};
Entry.Stage.prototype.selectObject = function(b) {
  this.selectedObject = b ? b : null;
  this.updateObject();
};
Entry.Stage.prototype.initHandle = function() {
  this.handle = new EaselHandle(this.canvas);
  this.handle.setChangeListener(this, this.updateHandle);
  this.handle.setEditStartListener(this, this.startEdit);
  this.handle.setEditEndListener(this, this.endEdit);
};
Entry.Stage.prototype.updateObject = function() {
  this.handle.setDraggable(!0);
  if (!this.editEntity) {
    var b = this.selectedObject;
    if (b) {
      "textBox" == b.objectType ? this.handle.toggleCenter(!1) : this.handle.toggleCenter(!0);
      "free" == b.getRotateMethod() ? this.handle.toggleRotation(!0) : this.handle.toggleRotation(!1);
      this.handle.toggleDirection(!0);
      b.getLock() ? (this.handle.toggleRotation(!1), this.handle.toggleDirection(!1), this.handle.toggleResize(!1), this.handle.toggleCenter(!1), this.handle.setDraggable(!1)) : this.handle.toggleResize(!0);
      this.handle.setVisible(!0);
      var a = b.entity;
      this.handle.setWidth(a.getScaleX() * a.getWidth());
      this.handle.setHeight(a.getScaleY() * a.getHeight());
      var d, c;
      if ("textBox" == a.type) {
        if (a.getLineBreak()) {
          d = a.regX * a.scaleX, c = -a.regY * a.scaleY;
        } else {
          var e = a.getTextAlign();
          c = -a.regY * a.scaleY;
          switch(e) {
            case Entry.TEXT_ALIGN_LEFT:
              d = -a.getWidth() / 2 * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_CENTER:
              d = a.regX * a.scaleX;
              break;
            case Entry.TEXT_ALIGN_RIGHT:
              d = a.getWidth() / 2 * a.scaleX;
          }
        }
      } else {
        d = (a.regX - a.width / 2) * a.scaleX, c = (a.height / 2 - a.regY) * a.scaleY;
      }
      e = a.getRotation() / 180 * Math.PI;
      this.handle.setX(a.getX() - d * Math.cos(e) - c * Math.sin(e));
      this.handle.setY(-a.getY() - d * Math.sin(e) + c * Math.cos(e));
      this.handle.setRegX((a.regX - a.width / 2) * a.scaleX);
      this.handle.setRegY((a.regY - a.height / 2) * a.scaleY);
      this.handle.setRotation(a.getRotation());
      this.handle.setDirection(a.getDirection());
      this.objectUpdated = !0;
      this.handle.setVisible(b.entity.getVisible());
      b.entity.getVisible() && this.handle.render();
    } else {
      this.handle.setVisible(!1);
    }
  }
};
Entry.Stage.prototype.updateHandle = function() {
  this.editEntity = !0;
  var b = this.handle, a = this.selectedObject.entity;
  a.lineBreak ? (a.setHeight(b.height / a.getScaleY()), a.setWidth(b.width / a.getScaleX())) : (0 !== a.width && (0 > a.getScaleX() ? a.setScaleX(-b.width / a.width) : a.setScaleX(b.width / a.width)), 0 !== a.height && a.setScaleY(b.height / a.height));
  var d = b.rotation / 180 * Math.PI;
  if ("textBox" == a.type) {
    var c = b.regX / a.scaleX, c = b.regY / a.scaleY;
    if (a.getLineBreak()) {
      a.setX(b.x), a.setY(-b.y);
    } else {
      switch(a.getTextAlign()) {
        case Entry.TEXT_ALIGN_LEFT:
          a.setX(b.x - b.width / 2 * Math.cos(d));
          a.setY(-b.y + b.width / 2 * Math.sin(d));
          break;
        case Entry.TEXT_ALIGN_CENTER:
          a.setX(b.x);
          a.setY(-b.y);
          break;
        case Entry.TEXT_ALIGN_RIGHT:
          a.setX(b.x + b.width / 2 * Math.cos(d)), a.setY(-b.y - b.width / 2 * Math.sin(d));
      }
    }
  } else {
    c = a.width / 2 + b.regX / a.scaleX, a.setX(b.x + b.regX * Math.cos(d) - b.regY * Math.sin(d)), a.setRegX(c), c = a.height / 2 + b.regY / a.scaleY, a.setY(-b.y - b.regX * Math.sin(d) - b.regY * Math.cos(d)), a.setRegY(c);
  }
  a.setDirection(b.direction);
  a.setRotation(b.rotation);
  this.selectedObject.entity.doCommand();
  this.editEntity = !1;
};
Entry.Stage.prototype.startEdit = function() {
  this.selectedObject.entity.initCommand();
};
Entry.Stage.prototype.endEdit = function() {
  this.selectedObject.entity.checkCommand();
};
Entry.Stage.prototype.initWall = function() {
  var b = new createjs.Container, a = new Image;
  a.src = Entry.mediaFilePath + "media/bound.png";
  b.up = new createjs.Bitmap;
  b.up.scaleX = 16;
  b.up.y = -165;
  b.up.x = -240;
  b.up.image = a;
  b.addChild(b.up);
  b.down = new createjs.Bitmap;
  b.down.scaleX = 16;
  b.down.y = 135;
  b.down.x = -240;
  b.down.image = a;
  b.addChild(b.down);
  b.right = new createjs.Bitmap;
  b.right.scaleY = 9;
  b.right.y = -135;
  b.right.x = 240;
  b.right.image = a;
  b.addChild(b.right);
  b.left = new createjs.Bitmap;
  b.left.scaleY = 9;
  b.left.y = -135;
  b.left.x = -270;
  b.left.image = a;
  b.addChild(b.left);
  this.canvas.addChild(b);
  this.wall = b;
};
Entry.Stage.prototype.showInputField = function(b) {
  b = 1 / 1.5;
  this.inputField || (this.inputField = new CanvasInput({canvas:document.getElementById("entryCanvas"), fontSize:30 * b, fontFamily:"NanumGothic", fontColor:"#212121", width:556 * b, height:26 * b, padding:8 * b, borderWidth:1 * b, borderColor:"#000", borderRadius:3 * b, boxShadow:"none", innerShadow:"0px 0px 5px rgba(0, 0, 0, 0.5)", x:202 * b, y:450 * b, topPosition:!0, onsubmit:function() {
    Entry.dispatchEvent("canvasInputComplete");
  }}));
  b = new createjs.Container;
  var a = new Image;
  a.src = Entry.mediaFilePath + "confirm_button.png";
  var d = new createjs.Bitmap;
  d.scaleX = .23;
  d.scaleY = .23;
  d.x = 160;
  d.y = 89;
  d.cursor = "pointer";
  d.image = a;
  b.addChild(d);
  b.on("mousedown", function(a) {
    Entry.dispatchEvent("canvasInputComplete");
  });
  this.inputSubmitButton || (this.inputField.value(""), this.canvas.addChild(b), this.inputSubmitButton = b);
  this.inputField.show();
};
Entry.Stage.prototype.hideInputField = function() {
  this.inputField && this.inputField.value() && this.inputField.value("");
  this.inputSubmitButton && (this.canvas.removeChild(this.inputSubmitButton), this.inputSubmitButton = null);
  this.inputField && this.inputField.hide();
};
Entry.Stage.prototype.initObjectContainers = function() {
  var b = Entry.scene.scenes_;
  if (b && 0 !== b.length) {
    for (var a = 0;a < b.length;a++) {
      this.objectContainers[a] = this.createObjectContainer(b[a]);
    }
    this.selectedObjectContainer = this.objectContainers[0];
  } else {
    b = this.createObjectContainer(Entry.scene.selectedScene), this.objectContainers.push(b), this.selectedObjectContainer = b;
  }
  this.canvas.addChild(this.selectedObjectContainer);
  this.selectObjectContainer(Entry.scene.selectedScene);
};
Entry.Stage.prototype.selectObjectContainer = function(b) {
  if (this.canvas) {
    for (var a = this.objectContainers, d = 0;d < a.length;d++) {
      this.canvas.removeChild(a[d]);
    }
    this.selectedObjectContainer = this.getObjectContainerByScene(b);
    this.canvas.addChildAt(this.selectedObjectContainer, 2);
  }
};
Entry.Stage.prototype.reAttachToCanvas = function() {
  for (var b = [this.selectedObjectContainer, this.variableContainer, this.coordinator, this.handle, this.dialogContainer], a = 0;a < b.length;a++) {
    this.canvas.removeChild(b[a]), this.canvas.addChild(b[a]);
  }
  console.log(this.canvas.getChildIndex(this.selectedObjectContainer));
};
Entry.Stage.prototype.createObjectContainer = function(b) {
  var a = new createjs.Container;
  a.scene = b;
  return a;
};
Entry.Stage.prototype.removeObjectContainer = function(b) {
  var a = this.objectContainers;
  b = this.getObjectContainerByScene(b);
  this.canvas.removeChild(b);
  a.splice(this.objectContainers.indexOf(b), 1);
};
Entry.Stage.prototype.getObjectContainerByScene = function(b) {
  for (var a = this.objectContainers, d = 0;d < a.length;d++) {
    if (a[d].scene.id == b.id) {
      return a[d];
    }
  }
};
Entry.Stage.prototype.moveSprite = function(b) {
  if (this.selectedObject && Entry.stage.focused && !this.selectedObject.getLock()) {
    var a = 5;
    b.shiftKey && (a = 1);
    var d = this.selectedObject.entity;
    switch(b.keyCode) {
      case 38:
        d.setY(d.getY() + a);
        break;
      case 40:
        d.setY(d.getY() - a);
        break;
      case 37:
        d.setX(d.getX() - a);
        break;
      case 39:
        d.setX(d.getX() + a);
    }
    this.updateObject();
  }
};
Entry.StampEntity = function(b, a) {
  this.parent = b;
  this.type = b.objectType;
  this.isStamp = this.isClone = !0;
  this.width = a.getWidth();
  this.height = a.getHeight();
  "sprite" == this.type && (this.object = a.object.clone(!0), this.object.filters = null, a.effect && (this.effect = Entry.cloneSimpleObject(a.effect), this.applyFilter()));
  this.object.entity = this;
  if (a.dialog) {
    var d = a.dialog;
    new Entry.Dialog(this, d.message_, d.mode_, !0);
    this.dialog.object = a.dialog.object.clone(!0);
    Entry.stage.loadDialog(this.dialog);
  }
};
var EntityPrototype = Entry.EntityObject.prototype;
Entry.StampEntity.prototype.applyFilter = EntityPrototype.applyFilter;
Entry.StampEntity.prototype.removeClone = EntityPrototype.removeClone;
Entry.StampEntity.prototype.getWidth = EntityPrototype.getWidth;
Entry.StampEntity.prototype.getHeight = EntityPrototype.getHeight;
Entry.JsAstGenerator = function() {
};
(function(b) {
  b.generate = function(a) {
    return arcon.parse(a);
  };
})(Entry.JsAstGenerator.prototype);
Entry.PyAstGenerator = function() {
};
(function(b) {
  b.generate = function(a) {
    var b = filbert.parse, c = {locations:!1, ranges:!1}, e;
    try {
      return e = b(a, c), console.log("astTree", e), e;
    } catch (f) {
      console.log("parsing error", f.toString());
    }
  };
})(Entry.PyAstGenerator.prototype);
Entry.KeyboardCodeMap = function() {
};
(function(b) {
  b.keyCodeToChar = {8:"Backspace", 9:"Tab", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause/Break", 20:"Caps Lock", 27:"Esc", 32:"Space", 33:"Page Up", 34:"Page Down", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 45:"Insert", 46:"Delete", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 
  85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 91:"Windows", 93:"Right Click", 96:"Numpad 0", 97:"Numpad 1", 98:"Numpad 2", 99:"Numpad 3", 100:"Numpad 4", 101:"Numpad 5", 102:"Numpad 6", 103:"Numpad 7", 104:"Numpad 8", 105:"Numpad 9", 106:"Numpad *", 107:"Numpad +", 109:"Numpad -", 110:"Numpad .", 111:"Numpad /", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 144:"Num Lock", 145:"Scroll Lock", 182:"My Computer", 183:"My Calculator", 
  186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"};
  b.keyCharToCode = {Backspace:8, Tab:9, Enter:13, Shift:16, Ctrl:17, Alt:18, "Pause/Break":19, "Caps Lock":20, Esc:27, Space:32, "Page Up":33, "Page Down":34, End:35, Home:36, Left:37, Up:38, Right:39, Down:40, Insert:45, Delete:46, 0:48, 1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, Windows:91, "Right Click":93, "Numpad 0":96, "Numpad 1":97, 
  "Numpad 2":98, "Numpad 3":99, "Numpad 4":100, "Numpad 5":101, "Numpad 6":102, "Numpad 7":103, "Numpad 8":104, "Numpad 9":105, "Numpad *":106, "Numpad +":107, "Numpad -":109, "Numpad .":110, "Numpad /":111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, "Num Lock":144, "Scroll Lock":145, "My Computer":182, "My Calculator":183, ";":186, "=":187, ",":188, "-":189, ".":190, "/":191, "`":192, "[":219, "\\":220, "]":221, "'":222};
})(Entry.KeyboardCodeMap.prototype);
Entry.BlockToJsParser = function(b) {
  this.syntax = b;
  this._iterVariableCount = 0;
  this._iterVariableChunk = ["i", "j", "k"];
};
(function(b) {
  b.Code = function(a) {
    if (a instanceof Entry.Thread) {
      return this.Thread(a);
    }
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getThreads();
    for (var c = 0;c < a.length;c++) {
      b += this.Thread(a[c]);
    }
    return b;
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var c = 0;c < a.length;c++) {
      b += this.Block(a[c]);
    }
    return b;
  };
  b.Block = function(a) {
    var b = a._schema.syntax;
    if (!b) {
      return "";
    }
    console.log("syntaxType", b);
    return this[b](a);
  };
  b.Program = function(a) {
    return "";
  };
  b.Scope = function(a) {
    a = a._schema.syntax.concat();
    return a.splice(1, a.length - 1).join(".") + "();\n";
  };
  b.BasicFunction = function(a) {
    a = this.Thread(a.statements[0]);
    return "function promise() {\n" + this.indent(a) + "}\n";
  };
  b.BasicIteration = function(a) {
    var b = a.params[0], c = this.publishIterateVariable();
    a = this.Thread(a.statements[0]);
    this.unpublishIterateVariable();
    return "for (var " + c + " = 0; " + c + " < " + b + "; " + c + "++){\n" + this.indent(a) + "}\n";
  };
  b.BasicIf = function(a) {
    var b = this.Thread(a.statements[0]);
    return "if (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.BasicWhile = function(a) {
    var b = this.Thread(a.statements[0]);
    return "while (" + a._schema.syntax.concat()[1] + ") {\n" + this.indent(b) + "}\n";
  };
  b.indent = function(a) {
    var b = "    ";
    a = a.split("\n");
    a.pop();
    return b += a.join("\n    ") + "\n";
  };
  b.publishIterateVariable = function() {
    var a = "", b = this._iterVariableCount;
    do {
      a = this._iterVariableChunk[b % 3] + a, b = parseInt(b / 3) - 1, 0 === b && (a = this._iterVariableChunk[0] + a);
    } while (0 < b);
    this._iterVariableCount++;
    return a;
  };
  b.unpublishIterateVariable = function() {
    this._iterVariableCount && this._iterVariableCount--;
  };
})(Entry.BlockToJsParser.prototype);
Entry.JsToBlockParser = function(b) {
  this.syntax = b;
  this.scopeChain = [];
  this.scope = null;
};
(function(b) {
  b.Program = function(a) {
    var b = [], c = [];
    c.push({type:this.syntax.Program});
    var e = this.initScope(a), c = c.concat(this.BlockStatement(a));
    this.unloadScope();
    b.push(c);
    return b = b.concat(e);
  };
  b.Identifier = function(a, b) {
    return b ? b[a.name] : this.scope[a.name];
  };
  b.ExpressionStatement = function(a) {
    a = a.expression;
    return this[a.type](a);
  };
  b.ForStatement = function(a) {
    var b = a.init, c = a.test, e = a.update, f = a.body;
    if (this.syntax.ForStatement) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    var f = this[f.type](f), b = b.declarations[0].init.value, g = c.operator, c = c.right.value, h = 0;
    "++" != e.operator && (e = b, b = c, c = e);
    switch(g) {
      case "<":
        h = c - b;
        break;
      case "<=":
        h = c + 1 - b;
        break;
      case ">":
        h = b - c;
        break;
      case ">=":
        h = b + 1 - c;
    }
    return this.BasicIteration(a, h, f);
  };
  b.BlockStatement = function(a) {
    var b = [];
    a = a.body;
    for (var c = 0;c < a.length;c++) {
      var e = a[c], f = this[e.type](e);
      if (f) {
        if (void 0 === f.type) {
          throw {message:"\ud574\ub2f9\ud558\ub294 \ube14\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.", node:e};
        }
        f && b.push(f);
      }
    }
    return b;
  };
  b.EmptyStatement = function(a) {
    throw {message:"empty\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.DebuggerStatement = function(a) {
    throw {message:"debugger\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WithStatement = function(a) {
    throw {message:"with\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ReturnStaement = function(a) {
    throw {message:"return\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LabeledStatement = function(a) {
    throw {message:"label\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.BreakStatement = function(a) {
    throw {message:"break\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ContinueStatement = function(a) {
    throw {message:"continue\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.IfStatement = function(a) {
    if (this.syntax.IfStatement) {
      throw {message:"if\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicIf(a);
  };
  b.SwitchStatement = function(a) {
    throw {message:"switch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SwitchCase = function(a) {
    throw {message:"switch ~ case\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThrowStatement = function(a) {
    throw {message:"throw\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.TryStatement = function(a) {
    throw {message:"try\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CatchClause = function(a) {
    throw {message:"catch\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.WhileStatement = function(a) {
    var b = a.body, c = this.syntax.WhileStatement, b = this[b.type](b);
    if (c) {
      throw {message:"while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return this.BasicWhile(a, b);
  };
  b.DoWhileStatement = function(a) {
    throw {message:"do ~ while\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ForInStatement = function(a) {
    throw {message:"for ~ in\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionDeclaration = function(a) {
    if (this.syntax.FunctionDeclaration) {
      throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return null;
  };
  b.VariableDeclaration = function(a) {
    throw {message:"var\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ThisExpression = function(a) {
    return this.scope.this;
  };
  b.ArrayExpression = function(a) {
    throw {message:"array\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.ObjectExpression = function(a) {
    throw {message:"object\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.Property = function(a) {
    throw {message:"init, get, set\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.FunctionExpression = function(a) {
    throw {message:"function\uc740 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UnaryOperator = function() {
    return "- + ! ~ typeof void delete".split(" ");
  };
  b.updateOperator = function() {
    return ["++", "--"];
  };
  b.BinaryOperator = function() {
    return "== != === !== < <= > >= << >> >>> + - * / % , ^ & in instanceof".split(" ");
  };
  b.AssignmentExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.AssignmentOperator = function() {
    return "= += -= *= /= %= <<= >>= >>>= ,= ^= &=".split(" ");
  };
  b.LogicalExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub839\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.LogicalOperator = function() {
    return ["||", "&&"];
  };
  b.MemberExpression = function(a) {
    var b = a.object, c = a.property;
    console.log(b.type);
    b = this[b.type](b);
    console.log(b);
    c = this[c.type](c, b);
    if (Object(b) !== b || Object.getPrototypeOf(b) !== Object.prototype) {
      throw {message:b + "\uc740(\ub294) \uc798\ubabb\ub41c \uba64\ubc84 \ubcc0\uc218\uc785\ub2c8\ub2e4.", node:a};
    }
    b = c;
    if (!b) {
      throw {message:c + "\uc774(\uac00) \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.", node:a};
    }
    return b;
  };
  b.ConditionalExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.UpdateExpression = function(a) {
    throw {message:a.operator + "\uc740(\ub294) \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uba85\ub801\uc5b4 \uc785\ub2c8\ub2e4.", node:a};
  };
  b.CallExpression = function(a) {
    a = a.callee;
    return {type:this[a.type](a)};
  };
  b.NewExpression = function(a) {
    throw {message:"new\ub294 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.SequenceExpression = function(a) {
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
  };
  b.initScope = function(a) {
    if (null === this.scope) {
      var b = function() {
      };
      b.prototype = this.syntax.Scope;
    } else {
      b = function() {
      }, b.prototype = this.scope;
    }
    this.scope = new b;
    this.scopeChain.push(this.scope);
    return this.scanDefinition(a);
  };
  b.unloadScope = function() {
    this.scopeChain.pop();
    this.scope = this.scopeChain.length ? this.scopeChain[this.scopeChain.length - 1] : null;
  };
  b.scanDefinition = function(a) {
    a = a.body;
    for (var b = [], c = 0;c < a.length;c++) {
      var e = a[c];
      "FunctionDeclaration" === e.type && (this.scope[e.id.name] = this.scope.promise, this.syntax.BasicFunction && (e = e.body, b.push([{type:this.syntax.BasicFunction, statements:[this[e.type](e)]}])));
    }
    return b;
  };
  b.BasicFunction = function(a, b) {
    return null;
  };
  b.BasicIteration = function(a, b, c) {
    var e = this.syntax.BasicIteration;
    if (!e) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a};
    }
    return {params:[b], type:e, statements:[c]};
  };
  b.BasicWhile = function(a, b) {
    var c = a.test.raw;
    if (this.syntax.BasicWhile[c]) {
      return {type:this.syntax.BasicWhile[c], statements:[b]};
    }
    throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
  };
  b.BasicIf = function(a) {
    var b = a.consequent, b = this[b.type](b);
    try {
      var c = "", e = "===" === a.test.operator ? "==" : a.test.operator;
      if ("Identifier" === a.test.left.type && "Literal" === a.test.right.type) {
        c = a.test.left.name + " " + e + " " + a.test.right.raw;
      } else {
        if ("Literal" === a.test.left.type && "Identifier" === a.test.right.type) {
          c = a.test.right.name + " " + e + " " + a.test.left.raw;
        } else {
          throw Error();
        }
      }
      if (this.syntax.BasicIf[c]) {
        return Array.isArray(b) || "object" !== typeof b || (b = [b]), {type:this.syntax.BasicIf[c], statements:[b]};
      }
      throw Error();
    } catch (f) {
      throw {message:"\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ud45c\ud604\uc2dd \uc785\ub2c8\ub2e4.", node:a.test};
    }
  };
})(Entry.JsToBlockParser.prototype);
Entry.TextCodingUtil = function() {
};
(function(b) {
  b.indent = function(a) {
    console.log("indent textCode", a);
    var b = "\t";
    a = a.split("\n");
    a.pop();
    return b += a.join("\n\t");
  };
  b.isNumeric = function(a) {
    return a.match(/^-?\d+$|^-\d+$/) || a.match(/^-?\d+\.\d+$/) ? !0 : !1;
  };
  b.isBinaryOperator = function(a) {
    return "==" == a || ">" == a || "<" == a || ">=" == a || "<=" == a || "+" == a || "-" == a || "*" == a || "/" == a ? !0 : !1;
  };
  b.binaryOperatorConvert = function(a) {
    console.log("binaryOperatorConvert", a);
    switch(a) {
      case "==":
        a = "EQUAL";
        break;
      case ">":
        a = "GREATER";
        break;
      case "<":
        a = "LESS";
        break;
      case ">=":
        a = "GREATER_OR_EQUAL";
        break;
      case "<=":
        a = "LESS_OR_EQUAL";
        break;
      case "+":
        a = "PLUS";
        break;
      case "-":
        a = "MINUS";
        break;
      case "*":
        a = "MULTIFLY";
        break;
      case "/":
        a = "DIVIDE";
        break;
    }
    return a;
  };
  b.logicalExpressionConvert = function(a) {
    console.log("logicalExpressionConvert", a);
    switch(a) {
      case "&&":
        a = null;
        break;
      case "||":
        a = null;
        break;
    }
    return a;
  };
  b.dropdownDynamicValueConvertor = function(a, b) {
    var c = b.options, e = null, f;
    for (f in c) {
      e = c[f];
      if ("null" == e[1]) {
        return e = "none";
      }
      if ("mouse" == a || "wall" == a || "wall_up" == a || "wall_down" == a || "wall_right" == a || "wall_left" == a) {
        return a;
      }
      if (a == e[1]) {
        return e = e[0];
      }
    }
    e = a;
    console.log("b to py dd", e);
    return e;
  };
  b.binaryOperatorValueConvertor = function(a) {
    switch(a) {
      case "EQUAL":
        console.log("EQUAL");
        a = "==";
        break;
      case "GREATER":
        a = ">";
        break;
      case "LESS":
        a = "<";
        break;
      case "GREATER_OR_EQUAL":
        a = ">=";
        break;
      case "LESS_OR_EQUAL":
        a = "<=";
        break;
      case "\uadf8\ub9ac\uace0":
        a = "&&";
        break;
      case "\ub610\ub294":
        a = "||";
        break;
      case "PLUS":
        a = "+";
        break;
      case "MINUS":
        a = "-";
        break;
      case "MULTI":
        a = "*";
        break;
      case "DIVIDE":
        a = "/";
        break;
    }
    console.log("booleanOperatorConvertor result", a);
    return a;
  };
})(Entry.TextCodingUtil.prototype);
Entry.BlockToPyParser = function() {
};
(function(b) {
  b.Code = function(a) {
    if (a instanceof Entry.Thread) {
      return this.Thread(a);
    }
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getThreads();
    for (var c = 0;c < a.length;c++) {
      b += this.Thread(a[c]) + "\n";
    }
    return b;
  };
  b.Thread = function(a) {
    if (a instanceof Entry.Block) {
      return this.Block(a);
    }
    var b = "";
    a = a.getBlocks();
    for (var c = 0;c < a.length;c++) {
      b += this.Block(a[c]) + "\n";
    }
    return b;
  };
  b.Block = function(a) {
    if (!a._schema || !a._schema.syntax) {
      return "";
    }
    var b = a._schema.syntax.py[0];
    if (!b || null == b) {
      return "";
    }
    for (var c = /(%.)/mi, e = /(\$.)/mi, b = b.split(c), f = a._schema.params, g = a.data.params, h = "", k = 0;k < b.length;k++) {
      var l = b[k];
      if (0 !== l.length) {
        if (c.test(l)) {
          if (l = l.split("%")[1], l = Number(l) - 1, f[l] && "Indicator" != f[l].type) {
            if ("Block" == f[l].type) {
              h += this.Block(g[l]).trim();
            } else {
              var n = this["Field" + f[l].type](g[l], f[l]);
              null == n && (n = f[l].text ? f[l].text : null);
              n = Entry.TextCodingUtil.prototype.binaryOperatorValueConvertor(n);
              n = String(n);
              Entry.TextCodingUtil.prototype.isNumeric(n) || Entry.TextCodingUtil.prototype.isBinaryOperator(n) || (n = String('"' + n + '"'));
              h += n;
            }
          }
        } else {
          if (e.test(l)) {
            for (var n = l.split(e), m = 0;m < n.length;m++) {
              l = n[m], 0 !== l.length && (e.test(l) ? (l = Number(l.split("$")[1]) - 1, h += Entry.TextCodingUtil.prototype.indent(this.Thread(a.statements[l]))) : h += l);
            }
          } else {
            n = 0, l.search("#"), -1 != l.search("#") && (n = l.indexOf("#"), l = l.substring(n + 1)), h += l;
          }
        }
      }
    }
    return h;
  };
  b.FieldAngle = function(a) {
    console.log("FieldAngle", a);
    return a;
  };
  b.FieldColor = function(a) {
    console.log("FieldColor", a);
    return a;
  };
  b.FieldDropdown = function(a) {
    console.log("FieldDropdown", a);
    return a;
  };
  b.FieldDropdownDynamic = function(a, b) {
    console.log("FieldDropdownDynamic", a);
    return a = "null" == a ? "none" : Entry.TextCodingUtil.prototype.dropdownDynamicValueConvertor(a, b);
  };
  b.FieldImage = function(a) {
    console.log("FieldImage", a);
    return a;
  };
  b.FieldIndicator = function(a) {
    console.log("FieldIndicator", a);
    return a;
  };
  b.FieldKeyboard = function(a) {
    console.log("FieldKeyboardInput", a);
    return a;
  };
  b.FieldOutput = function(a) {
    console.log("FieldOutput", a);
    return a;
  };
  b.FieldText = function(a) {
    console.log("FieldText", a);
    return a;
  };
  b.FieldTextInput = function(a) {
    console.log("FieldTextInput", a);
    return a;
  };
  b.FieldNumber = function(a) {
    console.log("FieldNumber", a);
    return a;
  };
  b.FieldKeyboard = function(a) {
    console.log("FieldKeyboard Before", a);
    (a = Entry.KeyboardCodeMap.prototype.keyCodeToChar[a]) && null != a || (a = "Q");
    console.log("FieldKeyboard After", a);
    return a;
  };
})(Entry.BlockToPyParser.prototype);
Entry.PyToBlockParser = function(b) {
  this.blockSyntax = b;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      b.push(e);
    }
    return b;
  };
  b.ExpressionStatement = function(a) {
    console.log("ExpressionStatement component", a);
    var b = {};
    a = a.expression;
    a.type && (a = this[a.type](a), a.params ? (b.type = a.type, b.params = a.params) : b.type = a.type, result = b);
    console.log("ExpressionStatement result", result);
    return result;
  };
  b.CallExpression = function(a) {
    console.log("CallExpression component", a);
    var b;
    b = {};
    var c = a.callee, c = this[c.type](c), arguments = a.arguments;
    console.log("CallExpression calleeData", c, "calleeData typeof", typeof c.object);
    c = "object" != typeof c.object ? String(c.object).concat(".").concat(String(c.property)) : String(c.object.object).concat(".").concat(String(c.object.property)).concat(".").concat(String(c.property));
    console.log("CallExpression calleeName", c);
    var e = this.getBlockType(c);
    console.log("CallExpression type before", e);
    "__pythonRuntime.functions.range" == c ? e = this.getBlockType("%1number#") : "__pythonRuntime.ops.add" == c ? (e = this.getBlockType("(%1 %2 %3)"), argumentData = {raw:"PLUS", type:"Literal", value:"PLUS"}, arguments.splice(1, 0, argumentData)) : "__pythonRuntime.ops.multiply" == c ? (e = this.getBlockType("(%1 %2 %3)"), argumentData = {raw:"MULTI", type:"Literal", value:"MULTI"}, arguments.splice(1, 0, argumentData)) : "__pythonRuntime.functions.len" == c && (e = this.getBlockType("len(%2)"));
    console.log("CallExpression type after", e);
    if (e) {
      var f = Entry.block[e], g = f.params, f = f.def.params, h = [];
      console.log("CallExpression component.arguments", arguments);
      console.log("CallExpression paramsMeta", g);
      console.log("CallExpression paramsDefMeta", f);
      for (var k in g) {
        var l = g[k].type;
        "Indicator" == l ? (l = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, l)) : "Text" == l && (l = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, l));
      }
      console.log("CallExpression arguments", arguments);
      for (var n in arguments) {
        k = arguments[n], console.log("CallExpression argument", typeof k), k = this[k.type](k, g[n], f[n]), console.log("CallExpression param", k), "__pythonRuntime.functions.range" == c && k.type ? (e = k.type, h = k.params) : h.push(k);
      }
      b.type = e;
      b.params = h;
    } else {
      b = null;
    }
    console.log("CallExpression result", b);
    return b;
  };
  b.Literal = function(a, b, c) {
    console.log("Literal component", a, "paramMeta", b, "paramDefMeta", c);
    var e = a.value;
    console.log("Literal value", e);
    b || (b = {type:"Block"}, c || (c = "number" == typeof e ? {type:"number"} : {type:"text"}));
    if ("Indicator" == b.type) {
      return null;
    }
    if ("Text" == b.type) {
      return "";
    }
    console.log("Literal paramMeta", b, "paramDefMeta", c);
    null != a.value ? (b = this["Param" + b.type](e, b, c), console.log("Literal param", void 0)) : (b = [], c = this[a.left.type](a.left), b.push(c), b.push(a.operator), a = this[a.right.type](a.right), b.push(a));
    a = b;
    console.log("Literal result", a);
    return a;
  };
  b.ParamBlock = function(a, b, c) {
    console.log("ParamBlock value", a, "paramMeta", b, "paramDefMeta", c);
    b = {};
    var e = a, f = [];
    if (!0 === a) {
      return b.type = "True", b;
    }
    if (!1 === a) {
      return b.type = "False", b;
    }
    var g = Entry.block[c.type], h = g.params, g = g.paramsDefMeta, k;
    for (k in h) {
      if ("Block" == h[k].type) {
        e = this.ParamBlock(a, h[k], g[k]);
        break;
      }
      var l = h[k].options;
      console.log("options", l);
      for (var n in l) {
        var m = l[n];
        if (a == m[0]) {
          e = m[1];
          break;
        }
      }
    }
    console.log("ParamBlock param", e);
    f.push(e);
    b.type = c.type;
    b.params = f;
    console.log("ParamBlock result", b);
    return b;
  };
  b.ParamTextInput = function(a, b, c) {
    return a;
  };
  b.ParamColor = function(a, b) {
    console.log("ParamColor value, paramMeta", a, b);
    console.log("ParamColor result", a);
    return a;
  };
  b.ParamDropdown = function(a, b) {
    console.log("ParamDropdown value, paramMeta", a, b);
    var c;
    c = String(a);
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  b.ParamDropdownDynamic = function(a, b) {
    console.log("ParamDropdownDynamic value, paramMeta", a, b);
    var c;
    if ("mouse" == a || "wall" == a || "wall_up" == a || "wall_down" == a || "wall_right" == a || "wall_left" == a) {
      return a;
    }
    var e = b.options;
    console.log("ParamDropdownDynamic options", e);
    for (var f in e) {
      if (console.log("options", e), a == e[f][0]) {
        console.log("options[i][0]", e[f][0]);
        c = e[f][1];
        break;
      }
    }
    c = String(c);
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  b.ParamKeyboard = function(a, b) {
    console.log("ParamKeyboard value, paramMeta", a, b);
    var c;
    c = Entry.KeyboardCodeMap.prototype.keyCharToCode[a];
    console.log("ParamKeyboard result", c);
    return c;
  };
  b.Indicator = function(a, b, c) {
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression component", a);
    var b = {}, c = a.object;
    a = a.property;
    c = this[c.type](c);
    a = this[a.type](a);
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression structure", a);
    b.object = c;
    b.property = a;
    console.log("MemberExpression result", b);
    return b;
  };
  b.Identifier = function(a) {
    console.log("Identifiler component", a);
    a = a.name;
    console.log("Identifiler result", a);
    return a;
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement component", a);
    var b = {}, c = a.test, e;
    1 == c.value && (e = this.getBlockType("while True:\n$1"));
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    c && (c.type = "Literal", f = f[0], c = "Indicator" == f.type ? null : this[c.type](c, f), g.push(c));
    c = [];
    a = a.body.body;
    for (var h in a) {
      f = a[h], f = this[f.type](f), c.push(f);
    }
    b.type = e;
    b.params = g;
    b.statements = [];
    b.statements.push(c);
    console.log("WhileStatement result", b);
    return b;
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement component", a);
    var b = {statements:[], data:[]}, c = [], e = [];
    a = a.body;
    console.log("BlockStatement bodies", a);
    for (var f in a) {
      var g = a[f], g = this[g.type](g);
      g && null == g || (console.log("BlockStatement bodyData", g), e.push(g), console.log("BlockStatement data", e));
    }
    console.log("BlockStatement final data", e);
    b.data = e;
    if (e[0] && e[0].declarations && e[1]) {
      b.type = e[1].type;
      f = e[0].declarations;
      for (var h in f) {
        (a = f[h].init) && c.push(a);
      }
      b.params = c;
      b.statements = e[1].statements;
    }
    console.log("jhlee data check", e);
    console.log("BlockStatement statement result", b);
    return b;
  };
  b.IfStatement = function(a) {
    console.log("IfStatement component", a);
    var b;
    b = {statements:[]};
    var c, e = [], f = a.consequent, g = a.alternate;
    c = null != g ? "if_else" : "_if";
    b.type = c;
    console.log("IfStatement type", c);
    var h = a.test;
    if (null != h) {
      console.log("IfStatement test", h);
      if ("Literal" == h.type) {
        arguments = [];
        arguments.push(h.value);
        var k = Entry.block[c].params;
        c = Entry.block[c].def.params;
        console.log("IfStatement paramsMeta", k);
        console.log("IfStatement paramsDefMeta", c);
        for (var l in k) {
          var n = k[l].type;
          "Indicator" == n ? (n = {raw:null, type:"Literal", value:null}, l < arguments.length && arguments.splice(l, 0, n)) : "Text" == n && (n = {raw:"", type:"Literal", value:""}, l < arguments.length && arguments.splice(l, 0, n));
        }
        for (var m in arguments) {
          console.log("IfStatement argument", arguments[m]), l = this[h.type](h, k[m], c[m]), console.log("IfStatement Literal param", l), l && null != l && e.push(l);
        }
      } else {
        l = this[h.type](h), console.log("IfStatement Not Literal param", l), l && null != l && e.push(l);
      }
      e && 0 != e.length && (b.params = e);
    }
    console.log("IfStatement params result", e);
    if (null != f) {
      h = [];
      console.log("IfStatement consequent", f);
      f = this[f.type](f);
      console.log("IfStatement consequent data", f);
      f = f.data;
      console.log("IfStatement consequentsData", f);
      for (m in f) {
        k = f[m], console.log("IfStatement consData", k), k.init ? (b.type = k.type, console.log("IfStatement Check params", e), k.statements && (h = k.statements)) : k.type && h.push(k);
      }
      0 != h.length && b.statements.push(h);
    }
    if (null != g) {
      e = [];
      console.log("IfStatement alternate", g);
      g = this[g.type](g);
      console.log("IfStatement alternate data", g);
      g = g.data;
      for (m in g) {
        (f = g[m]) && e.push(f);
      }
      0 != e.length && b.statements.push(e);
    }
    console.log("IfStatement result", b);
    return b;
  };
  b.ForStatement = function(a) {
    console.log("ForStatement component", a);
    var b = {statements:[]}, c = this.getBlockType("for i in range(%1):\n$1");
    b.type = c;
    if (c = a.init) {
      var e = this[c.type](c)
    }
    b.init = e;
    console.log("ForStatement init", c);
    if (e = a.body.body) {
      for (var f in e) {
        0 != f && (c = e[f], console.log("ForStatement bodyData", c, "index", f), c = this[c.type](c), console.log("ForStatement data", c), "index", f, b.statements.push(c));
      }
    }
    console.log("ForStatement bodyData result", b);
    if (f = a.test) {
      var g = this[f.type](f)
    }
    b.test = g;
    console.log("ForStatement testData", g);
    if (a = a.update) {
      var h = this[a.type](a)
    }
    b.update = h;
    console.log("ForStatement updateData", h);
    console.log("ForStatement result", b);
    return b;
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement component", a);
    console.log("ForInStatement result", null);
    return null;
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration component", a);
    var b = {declarations:[]};
    a = a.declarations;
    for (var c in a) {
      var e = a[c], e = this[e.type](e);
      console.log("VariableDeclaration declarationData", e);
      b.declarations.push(e);
    }
    console.log("VariableDeclaration result", b);
    return b;
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator component", a);
    var b = {}, c = a.id, c = this[c.type](c);
    console.log("VariableDeclarator idData", c);
    b.id = c;
    a = a.init;
    a = this[a.type](a);
    b.init = a;
    console.log("VariableDeclarator initData", a);
    console.log("VariableDeclarator result", b);
    return b;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement component", a);
    a = {};
    var b = this.getBlockType("break");
    console.log("BreakStatement type", b);
    a.type = b;
    console.log("BreakStatement result", a);
    return a;
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression component", a);
    var b;
    a.prefix && (b = a.operator, a = a.argument, console.log("UnaryExpression operator", b), a.value = Number(b.concat(a.value)), b = this[a.type](a), console.log("UnaryExpression data", b));
    a = b;
    console.log("UnaryExpression result", a);
    return a;
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression component", a);
    var b;
    b = {};
    var c = String(a.operator);
    switch(c) {
      case "&&":
        var e = "%1 and %3";
        break;
      case "||":
        e = "%1 or %3";
        break;
      default:
        e = "%1 and %3";
    }
    var e = this.getBlockType(e), f = [], g = a.left;
    if (g.type) {
      if ("Literal" == g.type) {
        arguments = [];
        arguments.push(g.value);
        var c = Entry.block[e].params, h = Entry.block[e].def.params;
        console.log("LogicalExpression paramsMeta", c);
        console.log("LogicalExpression paramsDefMeta", h);
        for (var k in c) {
          var l = c[k].type;
          "Indicator" == l ? (l = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, l)) : "Text" == l && (l = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, l));
        }
        for (var n in arguments) {
          var m = arguments[n];
          console.log("LogicalExpression argument", m);
          m = this[g.type](g, c[n], h[n]);
          console.log("LogicalExpression param", m);
          m && null != m && f.push(m);
        }
      } else {
        (m = this[g.type](g)) && f.push(m);
      }
      console.log("LogicalExpression left param", m);
    } else {
      g = a.left, this[g.type](g);
    }
    c = String(a.operator);
    console.log("LogicalExpression operator", c);
    c && (m = c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), f.push(m));
    g = a.right;
    if (g.type) {
      if ("Literal" == g.type) {
        arguments = [];
        arguments.push(g.value);
        c = Entry.block[e].params;
        h = Entry.block[e].def.params;
        console.log("LogicalExpression paramsMeta", c);
        console.log("LogicalExpression paramsDefMeta", h);
        for (k in c) {
          l = c[k].type, "Indicator" == l ? (l = {raw:null, type:"Literal", value:null}, k < arguments.length && arguments.splice(k, 0, l)) : "Text" == l && (l = {raw:"", type:"Literal", value:""}, k < arguments.length && arguments.splice(k, 0, l));
        }
        for (n in arguments) {
          m = arguments[n], console.log("LogicalExpression argument", m), m = this[g.type](g, c[n], h[n]), console.log("LogicalExpression param", m), m && null != m && f.push(m);
        }
      } else {
        (m = this[g.type](g)) && f.push(m);
      }
      console.log("LogicalExpression right param", m);
    } else {
      g = a.right, this[g.type](g);
    }
    b.type = e;
    b.params = f;
    console.log("LogicalExpression result", b);
    return b;
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression component", a);
    var b, c = {}, e = String(a.operator);
    switch(e) {
      case "==":
        var f = "%1 %2 %3";
        break;
      case "!=":
        f = "%2 != True";
        break;
      case "<":
        f = "%1 %2 %3";
        break;
      case "<=":
        f = "%1 %2 %3";
        break;
      case ">":
        f = "%1 %2 %3";
        break;
      case ">=":
        f = "%1 %2 %3";
        break;
      case "+":
        f = "(%1 %2 %3)";
        break;
      case "-":
        f = "(%1 %2 %3)";
        break;
      case "*":
        f = "(%1 %2 %3)";
        break;
      case "/":
        f = "(%1 %2 %3)";
    }
    console.log("BinaryExpression operator", e);
    console.log("BinaryExpression syntax", f);
    if (f = this.getBlockType(f)) {
      console.log("BinaryExpression type", f);
      b = [];
      var g = a.left;
      console.log("BinaryExpression left", g);
      if (g.type) {
        if ("Literal" == g.type) {
          arguments = [];
          arguments.push(g.value);
          var h = Entry.block[f].params, k = Entry.block[f].def.params;
          console.log("IfStatement paramsMeta", h);
          console.log("IfStatement paramsDefMeta", k);
          for (var l in h) {
            var n = h[l].type;
            "Indicator" == n ? (n = {raw:null, type:"Literal", value:null}, l < arguments.length && arguments.splice(l, 0, n)) : "Text" == n && (n = {raw:"", type:"Literal", value:""}, l < arguments.length && arguments.splice(l, 0, n));
          }
          for (var m in arguments) {
            var q = arguments[m];
            console.log("IfStatement argument", q);
            q = this[g.type](g, h[m], k[m]);
            console.log("IfStatement param", q);
            q && null != q && b.push(q);
          }
        } else {
          (q = this[g.type](g)) && b.push(q);
        }
        console.log("BinaryExpression left param", q);
      }
      if (e = String(a.operator)) {
        console.log("BinaryExpression operator", e), (q = e = Entry.TextCodingUtil.prototype.binaryOperatorConvert(e)) && b.push(q);
      }
      e = a.right;
      if (e.type) {
        if ("Literal" == e.type) {
          arguments = [];
          arguments.push(e.value);
          h = Entry.block[f].params;
          k = Entry.block[f].def.params;
          console.log("IfStatement paramsMeta", h);
          console.log("IfStatement paramsDefMeta", k);
          for (l in h) {
            n = h[l].type, "Indicator" == n ? (n = {raw:null, type:"Literal", value:null}, l < arguments.length && arguments.splice(l, 0, n)) : "Text" == n && (n = {raw:"", type:"Literal", value:""}, l < arguments.length && arguments.splice(l, 0, n));
          }
          for (m in arguments) {
            q = arguments[m], console.log("IfStatement argument", q), q = this[e.type](e, h[m], k[m]), console.log("IfStatement param", q), q && null != q && b.push(q);
          }
        } else {
          (q = this[e.type](e)) && b.push(q);
        }
        console.log("BinaryExpression right param", q);
      }
      "boolean_not" == f && (b = [""], b[1] = this[g.type](g, h[1], k[2]), b[2] = "");
      c.type = f;
      c.params = b;
    } else {
      return b;
    }
    console.log("BinaryExpression params", b);
    b = c;
    console.log("BinaryExpression result", b);
    return b;
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    var b = {}, c = a.argument;
    if (c) {
      var e = this[c.type](c)
    }
    b.argument = e;
    b.operator = a.operator;
    b.prefix = a.prefix;
    console.log("UpdateExpression result", b);
    return b;
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression component", a);
    var b = [], c;
    c = a.left;
    c.type ? (c = this[c.type](c), console.log("AssignmentExpression left Literal param", c), c && b.push(c), console.log("AssignmentExpression left params", b)) : (c = a.left, this[c.type](c));
    operator = String(a.operator);
    console.log("AssignmentExpression operator", operator);
    operator && (c = operator = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator), b.push(c));
    c = a.right;
    c.type ? (c = this[c.type](c), console.log("AssignmentExpression right Literal param", c), c && b.push(c), console.log("AssignmentExpression right params", b)) : (c = a.right, this[c.type](c));
    console.log("AssignmentExpression params", b);
    console.log("AssignmentExpression result", result);
    return result;
  };
  b.getBlockType = function(a) {
    return this.blockSyntax[a];
  };
  b.NewExpression = function(a) {
    console.log("NewExpression component", a);
    var b;
    b = {params:[]};
    var c = a.callee, c = this[c.type](c), arguments = a.arguments, e = [], f;
    for (f in arguments) {
      var g = arguments[f];
      console.log("NewExpression argument", g);
      g = this[g.type](g);
      e.push(g);
    }
    b.callee = c;
    b.params = e;
    console.log("NewExpression result", b);
    return b;
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration component", a);
    console.log("FunctionDeclaration result", a);
    return a;
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    console.log("RegExp result", a);
    return a;
  };
  b.Function = function(a) {
    console.log("Function", a);
    console.log("Function result", a);
    return a;
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement", a);
    console.log("EmptyStatement result", a);
    return a;
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement", a);
    console.log("DebuggerStatement result", a);
    return a;
  };
  b.WithStatement = function(a) {
    console.log("WithStatement", a);
    console.log("WithStatement result", a);
    return a;
  };
  b.ReturnStaement = function(a) {
    console.log("ReturnStaement", a);
    console.log("ReturnStaement result", a);
    return a;
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement", a);
    console.log("LabeledStatement result", a);
    return a;
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement", a);
    console.log("ContinueStatement result", a);
    return a;
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement", a);
    console.log("SwitchStatement result", a);
    return a;
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase", a);
    console.log("SwitchCase result", a);
    return a;
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement", a);
    console.log("ThrowStatement result", a);
    return a;
  };
  b.TryStatement = function(a) {
    console.log("TryStatement", a);
    console.log("TryStatement result", a);
    return a;
  };
  b.CatchClause = function(a) {
    console.log("CatchClause", a);
    console.log("CatchClause result", a);
    return a;
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement", a);
    console.log("DoWhileStatement result", a);
    return a;
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    console.log("FunctionDeclaration result", a);
    return a;
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression", a);
    console.log("ThisExpression result", a);
    return a;
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression", a);
    console.log("ArrayExpression result", a);
    return a;
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression", a);
    console.log("ObjectExpression result", a);
    return a;
  };
  b.Property = function(a) {
    console.log("Property", a);
    console.log("Property result", a);
    return a;
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression", a);
    console.log("FunctionExpression result", a);
    return a;
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression", a);
    console.log("ConditionalExpression result", a);
    return a;
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression", a);
    console.log("SequenceExpression result", a);
    return a;
  };
})(Entry.PyToBlockParser.prototype);
Entry.Parser = function(b, a, d) {
  this._mode = b;
  this.syntax = {};
  this.codeMirror = d;
  this._lang = c || "js";
  this._type = a;
  this.availableCode = [];
  "maze" === b ? (this._stageId = Number(Ntry.configManager.getConfig("stageId")), this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code)) : b === Entry.Vim.WORKSPACE_MODE && this.mappingSyntax(Entry.Vim.WORKSPACE_MODE);
  this.syntax.js = this.mappingSyntaxJs(b);
  this.syntax.py = this.mappingSyntaxPy(b);
  console.log("py syntax", this.syntax.py);
  switch(this._lang) {
    case "js":
      this._parser = new Entry.JsToBlockParser(this.syntax);
      var c = this.syntax, e = {}, f;
      for (f in c.Scope) {
        e[f + "();\n"] = c.Scope[f];
      }
      "BasicIf" in c && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(a) {
        CodeMirror.showHint(a, null, {globalScope:e});
      };
      d.on("keyup", function(a, b) {
        !a.state.completionActive && 65 <= b.keyCode && 95 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "py":
      this._parser = new Entry.PyToBlockParser(this.syntax);
      c = this.syntax;
      e = {};
      for (f in c.Scope) {
        e[f + "();\n"] = c.Scope[f];
      }
      "BasicIf" in c && (e.front = "BasicIf");
      CodeMirror.commands.javascriptComplete = function(a) {
        CodeMirror.showHint(a, null, {globalScope:e});
      };
      d.on("keyup", function(a, b) {
        !a.state.completionActive && 65 <= b.keyCode && 95 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:e});
      });
      break;
    case "blockJs":
      this._parser = new Entry.BlockToJsParser(this.syntax);
      c = this.syntax;
      break;
    case "blockPy":
      this._parser = new Entry.BlockToPyParser(this.syntax), c = this.syntax;
  }
};
(function(b) {
  b.setParser = function(a, b, c) {
    a === Entry.Vim.MAZE_MODE && (this._stageId = Number(Ntry.configManager.getConfig("stageId")), this.setAvailableCode(NtryData.config[this._stageId].availableCode, NtryData.player[this._stageId].code));
    this.mappingSyntax(a);
    this._type = b;
    switch(b) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        this._parser = new Entry.JsToBlockParser(this.syntax.js);
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        this._parser = new Entry.PyToBlockParser(this.syntax.py);
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        this._parser = new Entry.BlockToJsParser(this.syntax);
        a = this.syntax;
        var e = {}, f;
        for (f in a.Scope) {
          e[f + "();\n"] = a.Scope[f];
        }
        "BasicIf" in a && (e.front = "BasicIf");
        c.setOption("mode", {name:"javascript", globalVars:!0});
        CodeMirror.commands.autoCompletion = function(a) {
          CodeMirror.showHint(a, null, {globalScope:e});
        };
        c.on("keyup", function(a, b) {
          !a.state.completionActive && 65 <= b.keyCode && 95 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1, globalScope:e});
        });
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        this._parser = new Entry.BlockToPyParser, c.setOption("mode", {name:"python", globalVars:!0}), CodeMirror.commands.autoCompletion = function(a) {
          CodeMirror.showHint(a, null, {globalScope:e});
        }, c.on("keyup", function(a, b) {
          65 <= b.keyCode && 195 >= b.keyCode && CodeMirror.showHint(a, null, {completeSingle:!1});
        });
    }
  };
  b.parse = function(a) {
    console.log("PARSER TYPE", this._type);
    var b = null;
    switch(this._type) {
      case Entry.Vim.PARSER_TYPE_JS_TO_BLOCK:
        try {
          var c = (new Entry.JsAstGenerator).generate(a), b = this._parser.Program(c);
        } catch (h) {
          this.codeMirror && (h instanceof SyntaxError ? (b = {from:{line:h.loc.line - 1, ch:h.loc.column - 2}, to:{line:h.loc.line - 1, ch:h.loc.column + 1}}, h.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (b = this.getLineNumber(h.node.start, h.node.end), b.message = h.message, b.severity = "error", this.codeMirror.markText(b.from, b.to, {className:"CodeMirror-lint-mark-error", __annotation:b, clearOnEnter:!0})), Entry.toast.alert("Error", h.message)), b = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_PY_TO_BLOCK:
        try {
          var e = new Entry.PyAstGenerator;
          console.log("code", a);
          var f = a.split("\n\n");
          f.splice(f.length - 1, 1);
          console.log("threaded", f);
          a = [];
          for (var g in f) {
            c = e.generate(f[g]), a.push(c);
          }
          console.log("astArr", a);
          b = this._parser.Program(a);
          console.log("result", b);
        } catch (h) {
          this.codeMirror && (h instanceof SyntaxError ? (b = {from:{line:h.loc.line - 1, ch:h.loc.column - 2}, to:{line:h.loc.line - 1, ch:h.loc.column + 1}}, h.message = "\ubb38\ubc95 \uc624\ub958\uc785\ub2c8\ub2e4.") : (b = this.getLineNumber(h.node.start, h.node.end), b.message = h.message, b.severity = "error", this.codeMirror.markText(b.from, b.to, {className:"CodeMirror-lint-mark-error", __annotation:b, clearOnEnter:!0})), Entry.toast.alert("Error", h.message)), b = [];
        }
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_JS:
        this._parser = new Entry.BlockToJsParser(this.syntax.js);
        b = this._parser.Code(a);
        b = b.match(/(.*{.*[\S|\s]+?}|.+)/g);
        b = Array.isArray(b) ? b.reduce(function(a, b, d) {
          var c = "";
          1 === d && (a += "\n");
          c = -1 < b.indexOf("function") ? b + a : a + b;
          return c + "\n";
        }) : "";
        break;
      case Entry.Vim.PARSER_TYPE_BLOCK_TO_PY:
        b = this._parser.Code(a);
    }
    return b;
  };
  b.getLineNumber = function(a, b) {
    var c = this.codeMirror.getValue(), e = {from:{}, to:{}}, f = c.substring(0, a).split(/\n/gi);
    e.from.line = f.length - 1;
    e.from.ch = f[f.length - 1].length;
    c = c.substring(0, b).split(/\n/gi);
    e.to.line = c.length - 1;
    e.to.ch = c[c.length - 1].length;
    return e;
  };
  b.mappingSyntax = function(a) {
    for (var b = Object.keys(Entry.block), c = 0;c < b.length;c++) {
      var e = b[c], f = Entry.block[e];
      if (f.mode === a && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
  };
  b.setAvailableCode = function(a, b) {
    var c = [];
    a.forEach(function(a, b) {
      a.forEach(function(a, b) {
        c.push(a.type);
      });
    });
    b instanceof Entry.Code ? b.getBlockList().forEach(function(a) {
      a.type !== NtryData.START && -1 === c.indexOf(a.type) && c.push(a.type);
    }) : b.forEach(function(a, b) {
      a.forEach(function(a, b) {
        a.type !== NtryData.START && -1 === c.indexOf(a.type) && c.push(a.type);
      });
    });
    this.availableCode = this.availableCode.concat(c);
  };
  b.mappingSyntaxJs = function(a) {
    for (var b = Object.keys(Entry.block), c = 0;c < b.length;c++) {
      var e = b[c], f = Entry.block[e];
      if (f.mode === a && -1 < this.availableCode.indexOf(e) && (f = f.syntax)) {
        for (var g = this.syntax, h = 0;h < f.length;h++) {
          var k = f[h];
          if (h === f.length - 2 && "function" === typeof f[h + 1]) {
            g[k] = f[h + 1];
            break;
          }
          g[k] || (g[k] = {});
          h === f.length - 1 ? g[k] = e : g = g[k];
        }
      }
    }
    return g;
  };
  b.mappingSyntaxPy = function(a) {
    if (a == Entry.Vim.WORKSPACE_MODE) {
      a = {};
      var b = Entry.block, c;
      for (c in b) {
        var e = b[c], f = null;
        e.syntax && e.syntax.py && (f = e.syntax.py, console.log("syntax", f));
        f && (f = String(f), f.match(/.*\..*\)/) && (e = f.indexOf("("), f = f.substring(0, e)), a[f] = c);
      }
      return a;
    }
  };
})(Entry.Parser.prototype);
Entry.PyBlockAssembler = function(b) {
  this.blockSyntax = b;
  this._blockStatmentIndex = 0;
  this._blockStatments = [];
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      b.push(e);
    }
    return b;
  };
  b.ExpressionStatement = function(a) {
    console.log("ExpressionStatement component", a);
    var b = {};
    a = a.expression;
    "Literal" == a.type ? (a = this[a.type]({type:"Block", accept:"booleanMagnet"}, a), b.type = a.type, result = b, console.log("ExpressionStatement type literal", result)) : (a = this[a.type](a), b.type = a.type, b.params = a.params, result = b, console.log("ExpressionStatement type not literal", result));
    console.log("ExpressionStatement result", result);
    return result;
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression component", a);
    var b = [], c;
    c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[0], c), console.log("AssignmentExpression left Literal param", c)) : c = this[c.type](c), c && b.push(c), console.log("AssignmentExpression left param", c)) : (c = a.left, this[c.type](c));
    operator = String(a.operator);
    console.log("AssignmentExpression operator", operator);
    operator && (c = operator = Entry.TextCodingUtil.prototype.logicalExpressionConvert(operator), b.push(c));
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](paramsMeta[2], c), console.log("AssignmentExpression right Literal param", c)) : c = this[c.type](c), c && b.push(c), console.log("AssignmentExpression right param", c)) : (c = a.right, this[c.type](c));
    console.log("AssignmentExpression params", b);
    console.log("AssignmentExpression result", result);
    return result;
  };
  b.CallExpression = function(a) {
    console.log("CallExpression component", a);
    var b;
    b = {};
    var c = a.callee, c = this[c.type](c);
    console.log("CallExpression calleeData", c, "calleeData typeof", typeof c);
    var e = "object" != typeof c.object ? String(c.object).concat(".").concat(String(c.property)) : String(c.object.object).concat(".").concat(String(c.object.property)).concat(".").concat(String(c.property));
    console.log("CallExpression syntax", e);
    c = this.getBlockType(e);
    console.log("CallExpression type1", c);
    c || "__pythonRuntime.functions.range" == e && (c = "repeat_basic");
    console.log("CallExpression type2", c);
    e = Entry.block[c].params;
    console.log("CallExpression paramsMeta", e);
    var arguments = a.arguments, f = [], g;
    for (g in arguments) {
      var h = arguments[g];
      console.log("CallExpression argument", h);
      if ("Literal" == h.type) {
        var k = e[g];
        "Indicator" == k.type ? (h = null, f.push(h), g--) : (console.log("CallExpression argument index", h.type, g), h = this[h.type](k, h, c, g), f.push(h));
        g == arguments.length - 1 && (console.log("CallExpression in1"), g < e.length && (console.log("CallExpression in2"), f.push(null)));
        console.log("CallExpression i", g);
      }
    }
    console.log("CallExpression params", f);
    b.type = c;
    b.params = f;
    console.log("CallExpression result", b);
    return b;
  };
  b.Literal = function(a, b, c, e) {
    console.log("Literal paramMeta component particularIndex blockType", a, b, c, e);
    b = b.value;
    a = c ? this["Param" + a.type](a, b, c, e) : this["Param" + a.type](a, b);
    console.log("Literal result", a);
    return a;
  };
  b.ParamColor = function(a, b) {
    console.log("ParamColor paramMeta value", a, b);
    console.log("ParamColor result", b);
    return b;
  };
  b.ParamDropdown = function(a, b) {
    console.log("ParamDropdown paramMeta value", a, b);
    console.log("ParamDropdownDynamic result", b);
    return b;
  };
  b.ParamDropdownDynamic = function(a, b) {
    console.log("ParamDropdownDynamic paramMeta value", a, b);
    var c;
    if ("mouse" == b) {
      return "mouse";
    }
    var e = a.options, f;
    for (f in e) {
      if (console.log("options", e), b == e[f][0]) {
        console.log("options[i][0]", e[f][0]);
        c = e[f][1];
        break;
      }
    }
    console.log("ParamDropdownDynamic result", c);
    return c;
  };
  b.ParamKeyboard = function(a, b) {
    console.log("ParamKeyboard paramMeta value", a, b);
    var c;
    c = Entry.KeyboardCodeMap.prototype.keyCharToCode[b];
    console.log("ParamKeyboard result", c);
    return c;
  };
  b.ParamBlock = function(a, b, c, e) {
    console.log("ParamBlock paramMeta value blockType", a, b, c, e);
    var f = {}, g = [];
    c = Entry.TextCodingUtil.prototype.particularParam(c);
    if (null != c) {
      var h = c[e];
      if (h) {
        h = c[e];
        console.log("ParamBlock particularType", h);
        e = h;
        f.type = e;
        c = Entry.block[e].params;
        console.log("ParamBlock particular block paramsMeta", a);
        var k, l;
        for (l in c) {
          a = c[l];
          a = a.options;
          for (var n in a) {
            h = a[n], b == h[0] && (k = h[1]);
          }
        }
        g.push(k);
        f.params = g;
      } else {
        switch(e = typeof b, e) {
          case "number":
            f.type = "number";
            g.push(b);
            f.params = g;
            break;
          case "boolean":
            1 == b ? f.type = "True" : 0 == b && (f.type = "False");
            break;
          default:
            f.type = "text", g.push(b), f.params = g;
        }
      }
    } else {
      switch(e = typeof b, e) {
        case "number":
          f.type = "number";
          g.push(b);
          f.params = g;
          break;
        case "boolean":
          1 == b ? f.type = "True" : 0 == b && (f.type = "False");
          break;
        default:
          f.type = "text", g.push(b), f.params = g;
      }
    }
    console.log("ParamBlock valueType", e);
    console.log("ParamBlock result", f);
    return f;
  };
  b.Indicator = function(a, b, c) {
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression component", a);
    var b = {}, c = a.object;
    a = a.property;
    c = this[c.type](c);
    a = this[a.type](a);
    console.log("MemberExpression objectData", c);
    console.log("MemberExpression structure", a);
    b.object = c;
    b.property = a;
    console.log("MemberExpression result", b);
    return b;
  };
  b.Identifier = function(a) {
    console.log("Identifiler component", a);
    a = a.name;
    console.log("Identifiler result", a);
    return a;
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement component", a);
    var b = {}, c = a.test, e;
    1 == c.value && (e = this.getBlockType("while True:\n$1"));
    console.log("WhileStatement type", e);
    var f = Entry.block[e].params;
    console.log("WhileStatement paramsMeta", f);
    var g = [];
    c && (c.type = "Literal", f = f[0], c = "Indicator" == f.type ? null : this[c.type](f, c), g.push(c));
    c = [];
    a = a.body.body;
    for (var h in a) {
      f = a[h], f = this[f.type](f), c.push(f);
    }
    b.type = e;
    b.params = g;
    b.statements = [];
    b.statements.push(c);
    console.log("WhileStatement result", b);
    return b;
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement component", a);
    this._blockStatmentIndex = 0;
    this._blockStatments = [];
    var b = {};
    a = a.body;
    for (var c in a) {
      var e = a[c];
      console.log("BlockStatement body", e, "i", c);
      e = this[e.type](e);
      console.log("BlockStatement bodyData", e, "i", c);
      if (e.declarations) {
        console.log("BlockStatement statements type params bodyData", c, e);
        var e = e.declarations, f;
        for (f in e) {
          var g = e[f];
          g.init.type && (b.type = g.init.type);
          g.init.params && (console.log("BlockStatement params", g.init.params), b.params = g.init.params);
          console.log("BlockStatement structure", b, "j", f);
        }
      } else {
        0 == this._blockStatmentIndex && this._blockStatments.push(e);
      }
    }
    b.statements = [this._blockStatments];
    console.log("BlockStatement result", b);
    this._blockStatmentIndex++;
    return b;
  };
  b.IfStatement = function(a) {
    console.log("IfStatement component", a);
    var b = {}, c = [], e = [], f = [], g = [], h = a.test, k = a.alternate, l = a.consequent;
    a = this.getBlockType(null == k ? "if %1:\n$1" : "if %1:\n$1\nelse:\n$2");
    if (null != h) {
      var n = Entry.block[a].params;
      console.log("IfStatement paramsMeta", n);
      c = [];
      h.type = "Literal";
      n = n[0];
      h = "Indicator" == n.type ? null : this[h.type](n, h);
      c.push(h);
    }
    if (null != l) {
      for (var m in l.body) {
        if (h = l.body[m]) {
          h = this[h.type](h), console.log("IfStatement consequent bodyData", h), e.push(h);
        }
      }
    }
    if (null != k) {
      for (m in k.body) {
        if (h = k.body[m]) {
          h = this[h.type](h), console.log("IfStatement alternate bodyData", h), f.push(h);
        }
      }
    }
    0 != e.length && g.push(e);
    0 != f.length && g.push(f);
    b.type = a;
    0 != c.length && (b.params = c);
    0 != g.length && (b.statements = g);
    console.log("IfStatement result", b);
    return b;
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration component", a);
    var b = {}, c = [];
    a = a.declarations;
    for (var e in a) {
      var f = a[e], f = this[f.type](f);
      console.log("VariableDeclaration declarationData", f);
      c.push(f);
    }
    b.declarations = c;
    console.log("VariableDeclaration result", b);
    return b;
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator component", a);
    var b = {}, c = a.id, e = this[c.type](c);
    console.log("VariableDeclarator idData", e);
    a = a.init;
    a = this[a.type](a);
    console.log("VariableDeclarator initData", a);
    b.id = c;
    b.init = a;
    console.log("VariableDeclarator result", b);
    return b;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement component", a);
    a = {};
    var b = this.getBlockType("break");
    a.type = b;
    console.log("BreakStatement result", a);
    return a;
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression component", a);
    var b = [];
    a.prefix && (a = a.operator.concat(a.argument.value), b.push(a));
    result.params = b;
    console.log("UnaryExpression result", result);
    return result;
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression component", a);
    var b = {}, c = String(a.operator);
    switch(c) {
      case "&&":
        var e = "%1 and %3";
        break;
      case "||":
        e = "%1 or %3";
        break;
      default:
        e = "%1 and %3";
    }
    var e = this.getBlockType(e), f = Entry.block[e].params;
    console.log("LogicalExpression paramsMeta", f);
    var g = [], c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("LogicalExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression left param", c)) : (c = a.left, this[c.type](c));
    c = String(a.operator);
    console.log("LogicalExpression operator", c);
    c && (c = Entry.TextCodingUtil.prototype.logicalExpressionConvert(c), g.push(c));
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("LogicalExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("LogicalExpression right param", c)) : (c = a.right, this[c.type](c));
    b.type = e;
    b.params = g;
    console.log("LogicalExpression result", b);
    return b;
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression component", a);
    var b = {params:[]}, c = String(a.operator);
    console.log("BinaryExpression operator", c);
    if (c) {
      var e = "(%1 %2 %3)"
    }
    console.log("BinaryExpression syntax", e);
    e = this.getBlockType(e);
    console.log("BinaryExpression type", e);
    var f = Entry.block[e].params;
    console.log("BinaryExpression paramsMeta", f);
    var g = [], c = a.left;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[0], c), console.log("BinaryExpression left Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression left param", c)) : (c = a.left, this[c.type](c));
    if (c = String(a.operator)) {
      console.log("BinaryExpression operator", c), (c = Entry.TextCodingUtil.prototype.binaryOperatorConvert(c)) && g.push(c);
    }
    c = a.right;
    c.type ? ("Literal" == c.type ? (c = this[c.type](f[2], c), console.log("BinaryExpression right Literal param", c)) : c = this[c.type](c), c && g.push(c), console.log("BinaryExpression right param", c)) : (c = a.right, this[c.type](c));
    console.log("BinaryExpression params", g);
    b.type = e;
    b.params = g;
    console.log("BinaryExpression result", b);
    return b;
  };
  b.getBlockType = function(a) {
    return this.blockSyntax[a];
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration component", a);
    console.log("FunctionDeclaration result", void 0);
    return a;
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    console.log("RegExp result", void 0);
    return a;
  };
  b.Function = function(a) {
    console.log("Function", a);
    console.log("Function result", void 0);
    return a;
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement", a);
    console.log("EmptyStatement result", void 0);
    return a;
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement", a);
    console.log("DebuggerStatement result", void 0);
    return a;
  };
  b.WithStatement = function(a) {
    console.log("WithStatement", a);
    console.log("WithStatement result", void 0);
    return a;
  };
  b.ReturnStaement = function(a) {
    console.log("ReturnStaement", a);
    console.log("ReturnStaement result", void 0);
    return a;
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement", a);
    console.log("LabeledStatement result", void 0);
    return a;
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement", a);
    console.log("BreakStatement result", void 0);
    return a;
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement", a);
    console.log("ContinueStatement result", void 0);
    return a;
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement", a);
    console.log("SwitchStatement result", void 0);
    return a;
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase", a);
    console.log("SwitchCase result", void 0);
    return a;
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement", a);
    console.log("ThrowStatement result", void 0);
    return a;
  };
  b.TryStatement = function(a) {
    console.log("TryStatement", a);
    console.log("TryStatement result", void 0);
    return a;
  };
  b.CatchClause = function(a) {
    console.log("CatchClause", a);
    console.log("CatchClause result", void 0);
    return a;
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement", a);
    console.log("DoWhileStatement result", void 0);
    return a;
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement", a);
    console.log("ForInStatement result", void 0);
    return a;
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    console.log("FunctionDeclaration result", void 0);
    return a;
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression", a);
    console.log("ThisExpression result", void 0);
    return a;
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression", a);
    console.log("ArrayExpression result", void 0);
    return a;
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression", a);
    console.log("ObjectExpression result", void 0);
    return a;
  };
  b.Property = function(a) {
    console.log("Property", a);
    console.log("Property result", void 0);
    return a;
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression", a);
    console.log("FunctionExpression result", void 0);
    return a;
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    console.log("UpdateExpression result", void 0);
    return a;
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression", a);
    console.log("ConditionalExpression result", void 0);
    return a;
  };
  b.NewExpression = function(a) {
    console.log("NewExpression", a);
    console.log("NewExpression result", void 0);
    return a;
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression", a);
    console.log("SequenceExpression result", void 0);
    return a;
  };
})(Entry.PyBlockAssembler.prototype);
Entry.PyToBlockParserTemp = function(b) {
  this._assembler = new Entry.PyBlockAssembler(b);
};
(function(b) {
  b.Program = function(a) {
    var b = [], c;
    for (c in a) {
      if ("Program" != a[c].type) {
        return;
      }
      var e = [], f = a[c].body;
      console.log("nodes", f);
      for (c in f) {
        var g = f[c], g = this[g.type](g);
        console.log("checkitout", g);
        g = this._assembler[g.type](g);
        e.push(g);
      }
      console.log("thread", e);
      b.push(e);
    }
    return b;
  };
  b.Identifier = function(a) {
    console.log("Identifier", a);
    return {type:a.type, name:a.name};
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    var b = this[a.id.type](a.id);
    return {type:a.type, id:b};
  };
  b.Literal = function(a) {
    console.log("Literal", a);
    console.log("typeof node at Literal", typeof a.value);
    var b;
    "string" === typeof a.value ? b = a.value : "boolean" === typeof a.value ? b = a.value : "number" === typeof a.value ? b = a.value : "RegExp" === typeof a.value ? (b = this[typeof a.value](a), b = b.regex.pattern) : b = null;
    console.log("value", b);
    return {type:a.type, value:b};
  };
  b.RegExp = function(a) {
    console.log("RegExp", a);
    return {regex:a.regex};
  };
  b.Function = function(a) {
    console.log("Function", a);
    var b = this[a.id](a), c = [], e;
    for (e in a.params) {
      c.push(a.params[e]);
    }
    a = this[a.body](a);
    return {id:b, params:c, body:a};
  };
  b.ExpressionStatement = function(a) {
    var b = this[a.expression.type](a.expression);
    return {type:a.type, expression:b};
  };
  b.BlockStatement = function(a) {
    console.log("BlockStatement", a);
    var b = [], c;
    for (c in a.body) {
      var e = a.body[c];
      console.log("BlockStatement statement", e);
      e = this[e.type](e);
      console.log("BlockStatement body", e);
      b.push(e);
    }
    console.log("bodies", b);
    return {type:a.type, body:b};
  };
  b.EmptyStatement = function(a) {
    console.log("EmptyStatement", a);
    return {type:a.type};
  };
  b.DebuggerStatement = function(a) {
    console.log("DebuggerStatement", a);
    return {type:a.type};
  };
  b.WithStatement = function(a) {
    console.log("WithStatement", a);
    var b = this[a.object.type](a.object), c = this[a.body.type](a.body);
    return {type:a.type, object:b, body:c};
  };
  b.ReturnStaement = function(a) {
    console.log("ReturnStaement", a);
    var b;
    b = null === a.argument ? null : this[a.argument.type](a.argument);
    return {type:a.type, argument:b};
  };
  b.LabeledStatement = function(a) {
    console.log("LabeledStatement", a);
    var b = this[a.label.type](a.label), c = this[a.body.type](a.body);
    return {type:a.type, label:b, body:c};
  };
  b.BreakStatement = function(a) {
    console.log("BreakStatement", a);
    var b;
    console.log("node.label", a.label);
    a.label && null !== a.label ? (console.log("node.label2", a.label), b = this[a.label.type](a.label)) : (console.log("node.lable1", a.label), b = null);
    console.log("label", b);
    return {type:a.type, label:b};
  };
  b.ContinueStatement = function(a) {
    console.log("ContinueStatement", a);
    var b;
    b = null === a.label ? null : this[a.label.type](a.label);
    return {type:a.type, label:b};
  };
  b.IfStatement = function(a) {
    console.log("IfStatement", a);
    var b = this[a.test.type](a.test), c = {body:[]};
    if (null === a.alternate) {
      c = null;
    } else {
      for (var e in a.alternate.body) {
        var f = a.alternate.body[e], g = this[f.type](f);
        c.body.push(g);
      }
    }
    g = {body:[]};
    for (e in a.consequent.body) {
      f = a.consequent.body[e], f = this[f.type](f), g.body.push(f);
    }
    console.log("alternate", c);
    console.log("consequent", g);
    return {type:a.type, test:b, consequent:g, alternate:c};
  };
  b.SwitchStatement = function(a) {
    console.log("SwitchStatement", a);
    var b = this[a.discriminant.type](a.discriminant), c = [], e;
    for (e in a.cases) {
      var f = a.cases[e], f = this[f.type](f);
      c.push(f);
    }
    return {type:a.type, discriminant:b, cases:c};
  };
  b.SwitchCase = function(a) {
    console.log("SwitchCase", a);
    var b;
    b = null === a.test ? null : this[a.test.type](a.test);
    for (var c in a.consequent) {
      a = this[statment.type](statment), (void 0).push(a);
    }
    return {test:b, consequent:void 0};
  };
  b.ThrowStatement = function(a) {
    console.log("ThrowStatement", a);
    var b = this[a.argument.type](a.argument);
    return {type:a.type, argument:b};
  };
  b.TryStatement = function(a) {
    console.log("TryStatement", a);
    var b = this[a.block.type](a.block), c;
    c = null === a.handler ? null : this[a.handler.type](a.handler);
    var e;
    e = null === a.finalizer ? null : this[a.finalizer.type](a.finalizer);
    return {type:a.type, block:b, handler:c, finalizer:e};
  };
  b.CatchClause = function(a) {
    console.log("CatchClause", a);
    var b = a.param;
    a = this[a.body.type](a.body);
    return {param:b, body:a};
  };
  b.WhileStatement = function(a) {
    console.log("WhileStatement", a);
    var b = this[a.test.type](a.test), c = this[a.body.type](a.body);
    console.log("WhileStatement test", b);
    console.log("WhileStatement body", c);
    return {type:a.type, test:b, body:c};
  };
  b.DoWhileStatement = function(a) {
    console.log("DoWhileStatement", a);
    var b;
    b = this[a.init.type](a.init);
    var c;
    c = null === a.test ? null : this[a.test.type](a.test);
    var e;
    e = null === a.update ? null : this[a.update.type](a.update);
    var f = this[a.body.type](a.body);
    return {type:a.type, init:b, test:c, update:e, body:f};
  };
  b.ForStatement = function(a) {
    console.log("ForStatement", a);
    var b;
    if (null === a.init) {
      b = null;
    } else {
      this[a.init.type](a.init);
    }
    var c;
    c = null === a.test ? null : this[a.test.type](a.test);
    var e;
    e = null === a.update ? null : this[a.update.type](a.update);
    var f = this[a.body.type](a.body);
    console.log("ForStatement body", f);
    return {type:a.type, init:b, test:c, update:e, body:f};
  };
  b.ForInStatement = function(a) {
    console.log("ForInStatement", a);
    var b;
    b = this[a.left.type](a.left);
    var c = this[a.right.type](a.right), e = this[a.body.type](a.body);
    return {type:a.type, left:b, right:c, body:e};
  };
  b.FunctionDeclaration = function(a) {
    console.log("FunctionDeclaration", a);
    return {id:this[a.id.type](a.id)};
  };
  b.VariableDeclaration = function(a) {
    console.log("VariableDeclaration", a);
    var b = [], c;
    for (c in a.declarations) {
      var e = a.declarations[c], e = this[e.type](e);
      console.log("declaration", e);
      b.push(e);
    }
    console.log("VariableDeclaration declarations", b);
    return {type:a.type, declarations:b, kind:"var"};
  };
  b.VariableDeclarator = function(a) {
    console.log("VariableDeclarator", a);
    var b = this[a.id.type](a.id), c;
    c = null === a.init ? null : this[a.init.type](a.init);
    console.log("id", b);
    console.log("init", c);
    return {type:a.type, id:b, init:c};
  };
  b.ThisExpression = function(a) {
    console.log("ThisExpression", a);
    return {type:a.type};
  };
  b.ArrayExpression = function(a) {
    console.log("ArrayExpression", a);
    var b;
    if (null === a.elements) {
      b = null;
    } else {
      for (var c in a.elements) {
        var e = a.elements[c], e = this[e.type](e);
        b.push(e);
      }
    }
    return {type:a.type, elements:b};
  };
  b.ObjectExpression = function(a) {
    console.log("ObjectExpression", a);
    for (var b in a.properties) {
      var c = a.properties[b], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:a.type, properties:void 0};
  };
  b.Property = function(a) {
    console.log("Property", a);
    var b = this[a.key.type](a.key), c = this[a.value.type](a.value);
    return {type:a.type, key:b, value:c, kind:a.kind};
  };
  b.FunctionExpression = function(a) {
    console.log("FunctionExpression", a);
    return {type:a.type};
  };
  b.UnaryExpression = function(a) {
    console.log("UnaryExpression", a);
    var b;
    switch(a.operator) {
      case "-":
        b = a.operator;
        break;
      case "+":
        b = a.operator;
        break;
      case "!":
        b = a.operator;
        break;
      case "~":
        b = a.operator;
        break;
      case "typeof":
        b = a.operator;
        break;
      case "void":
        b = a.operator;
        break;
      case "delete":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = a.prefix, e = this[a.argument.type](a.argument);
    return {type:a.type, operator:b, prefix:c, argument:e};
  };
  b.UpdateExpression = function(a) {
    console.log("UpdateExpression", a);
    var b;
    switch(a.operator) {
      case "++":
        b = a.operator;
        break;
      case "--":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.argument.type](a.argument);
    return {type:a.type, operator:b, prefix:a.prefix, argument:c};
  };
  b.BinaryExpression = function(a) {
    console.log("BinaryExpression", a);
    var b;
    switch(a.operator) {
      case "==":
        b = a.operator;
        break;
      case "!=":
        b = a.operator;
        break;
      case "===":
        b = a.operator;
        break;
      case "!==":
        b = a.operator;
        break;
      case "<":
        b = a.operator;
        break;
      case "<=":
        b = a.operator;
        break;
      case ">":
        b = a.operator;
        break;
      case ">=":
        b = a.operator;
        break;
      case "<<":
        b = a.operator;
        break;
      case ">>":
        b = a.operator;
        break;
      case ">>>":
        b = a.operator;
        break;
      case "+":
        b = a.operator;
        break;
      case "-":
        b = a.operator;
        break;
      case "*":
        b = a.operator;
        break;
      case "/":
        b = a.operator;
        break;
      case "%":
        b = a.operator;
        break;
      case "|":
        b = a.operator;
        break;
      case "^":
        b = a.operator;
        break;
      case "|":
        b = a.operator;
        break;
      case "&":
        b = a.operator;
        break;
      case "in":
        b = a.operator;
        break;
      case "instanceof":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.left.type](a.left), e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.AssignmentExpression = function(a) {
    console.log("AssignmentExpression", a);
    var b;
    switch(a.operator) {
      case "=":
        b = a.operator;
        break;
      case "+=":
        b = a.operator;
        break;
      case "-=":
        b = a.operator;
        break;
      case "*=":
        b = a.operator;
        break;
      case "/=":
        b = a.operator;
        break;
      case "%=":
        b = a.operator;
        break;
      case "<<=":
        b = a.operator;
        break;
      case ">>=":
        b = a.operator;
        break;
      case "|=":
        b = a.operator;
        break;
      case "^=":
        b = a.operator;
        break;
      case "&=":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c;
    c = a.left;
    var e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.LogicalExpression = function(a) {
    console.log("LogicalExpression", a);
    var b;
    switch(a.operator) {
      case "||":
        b = a.operator;
        break;
      case "&&":
        b = a.operator;
        break;
      default:
        b = null;
    }
    var c = this[a.left.type](a.left), e = this[a.right.type](a.right);
    return {type:a.type, operator:b, left:c, right:e};
  };
  b.MemberExpression = function(a) {
    console.log("MemberExpression", a);
    var b = this[a.object.type](a.object), c = this[a.property.type](a.property), e = a.computed;
    console.log("object", b);
    console.log("property", c);
    return {type:a.type, object:b, property:c, computed:e};
  };
  b.ConditionalExpression = function(a) {
    console.log("ConditionalExpression", a);
    var b = this[a.callee.type](a.callee), c;
    for (c in a.arguments) {
      var e = a.arguments[c], e = this[e.type](e);
      (void 0).push(e);
    }
    return {type:a.type, callee:b, arguments:void 0};
  };
  b.CallExpression = function(a) {
    console.log("CallExpression", a);
    var b = this[a.callee.type](a.callee), c = [], e;
    for (e in a.arguments) {
      var f = a.arguments[e], f = this[f.type](f);
      c.push(f);
    }
    console.log("callee", b);
    console.log("arguments", c);
    return {type:a.type, callee:b, arguments:c};
  };
  b.NewExpression = function(a) {
    console.log("NewExpression", a);
    return {type:a.type};
  };
  b.SequenceExpression = function(a) {
    console.log("SequenceExpression", a);
    for (var b in a.expressions) {
      var c = a.expressions[b], c = this[c.type](c);
      (void 0).push(c);
    }
    return {type:a.type, expressions:void 0};
  };
})(Entry.PyToBlockParserTemp.prototype);
Entry.Toast = function() {
  this.toasts_ = [];
  var b = document.getElementById("entryToastContainer");
  b && document.body.removeChild(b);
  this.body_ = Entry.createElement("div", "entryToastContainer");
  this.body_.addClass("entryToastContainer");
  document.body.appendChild(this.body_);
};
Entry.Toast.prototype.warning = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastWarning");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.success = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastSuccess");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.removeElement(c));
      c.style.opacity *= .9;
    }, 20);
  }, 1E3);
};
Entry.Toast.prototype.alert = function(b, a, d) {
  var c = Entry.createElement("div", "entryToast");
  c.addClass("entryToast");
  c.addClass("entryToastAlert");
  c.bindOnClick(function() {
    Entry.toast.body_.removeChild(this);
  });
  var e = Entry.createElement("div", "entryToast");
  e.addClass("entryToastTitle");
  e.innerHTML = b;
  c.appendChild(e);
  b = Entry.createElement("p", "entryToast");
  b.addClass("entryToastMessage");
  b.innerHTML = a;
  c.appendChild(b);
  this.toasts_.push(c);
  this.body_.appendChild(c);
  d || window.setTimeout(function() {
    c.style.opacity = 1;
    var a = setInterval(function() {
      .05 > c.style.opacity && (clearInterval(a), c.style.display = "none", Entry.toast.body_.removeChild(c));
      c.style.opacity *= .9;
    }, 20);
  }, 5E3);
};
Entry.TvCast = function(b) {
  this.generateView(b);
};
p = Entry.TvCast.prototype;
p.init = function(b) {
  this.tvCastHash = b;
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryHidden");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "tvCastIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", b);
  this.movieFrame = a;
  this.movieContainer.appendChild(this.movieFrame);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("tvCastIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};
Entry.BlockDriver = function() {
};
(function(b) {
  b.convert = function() {
    var a = new Date, b;
    for (b in Entry.block) {
      "function" === typeof Entry.block[b] && this._convertBlock(b);
    }
    console.log((new Date).getTime() - a.getTime());
  };
  b._convertBlock = function(a) {
    function b(a) {
      var c = {type:a.getAttribute("type"), index:{}};
      a = $(a).children();
      if (!a) {
        return c;
      }
      for (var e = 0;e < a.length;e++) {
        var f = a[e], g = f.tagName, h = $(f).children()[0], u = f.getAttribute("name");
        "value" === g ? "block" == h.nodeName && (c.params || (c.params = []), c.params.push(b(h)), c.index[u] = c.params.length - 1) : "field" === g && (c.params || (c.params = []), c.params.push(f.textContent), c.index[u] = c.params.length - 1);
      }
      return c;
    }
    var c = Blockly.Blocks[a], e = EntryStatic.blockInfo[a], f, g;
    if (e && (f = e.class, g = e.isNotFor, e = e.xml)) {
      var e = $.parseXML(e), h = b(e.childNodes[0])
    }
    c = (new Entry.BlockMockup(c, h, a)).toJSON();
    c.class = f;
    c.isNotFor = g;
    _.isEmpty(c.paramsKeyMap) && delete c.paramsKeyMap;
    _.isEmpty(c.statementsKeyMap) && delete c.statementsKeyMap;
    c.func = Entry.block[a];
    -1 < "NUMBER TRUE FALSE TEXT FUNCTION_PARAM_BOOLEAN FUNCTION_PARAM_STRING TRUE_UN".split(" ").indexOf(a.toUpperCase()) && (c.isPrimitive = !0);
    Entry.block[a] = c;
  };
})(Entry.BlockDriver.prototype);
Entry.BlockMockup = function(b, a, d) {
  this.templates = [];
  this.params = [];
  this.statements = [];
  this.color = "";
  this.output = this.isNext = this.isPrev = !1;
  this.fieldCount = 0;
  this.events = {};
  this.def = a || {};
  this.paramsKeyMap = {};
  this.statementsKeyMap = {};
  this.definition = {params:[], type:this.def.type};
  this.simulate(b);
  this.def = this.definition;
};
(function(b) {
  b.simulate = function(a) {
    a.sensorList && (this.sensorList = a.sensorList);
    a.portList && (this.portList = a.portList);
    a.init.call(this);
    a.whenAdd && (this.events.blockViewAdd || (this.events.blockViewAdd = []), this.events.blockViewAdd.push(a.whenAdd));
    a.whenRemove && (this.events.blockViewDestroy || (this.events.blockViewDestroy = []), this.events.blockViewDestroy.push(a.whenRemove));
  };
  b.toJSON = function() {
    function a(b) {
      if (b && (b = b.params)) {
        for (var d = 0;d < b.length;d++) {
          var c = b[d];
          c && (delete c.index, a(c));
        }
      }
    }
    var b = "";
    this.output ? b = "Boolean" === this.output ? "basic_boolean_field" : "basic_string_field" : !this.isPrev && this.isNext ? b = "basic_event" : 1 == this.statements.length ? b = "basic_loop" : 2 == this.statements.length ? b = "basic_double_loop" : this.isPrev && this.isNext ? b = "basic" : this.isPrev && !this.isNext && (b = "basic_without_next");
    a(this.def);
    var c = /dummy_/mi, e;
    for (e in this.paramsKeyMap) {
      c.test(e) && delete this.paramsKeyMap[e];
    }
    for (e in this.statementsKeyMap) {
      c.test(e) && delete this.statementsKeyMap[e];
    }
    return {color:this.color, skeleton:b, statements:this.statements, template:this.templates.filter(function(a) {
      return "string" === typeof a;
    }).join(" "), params:this.params, events:this.events, def:this.def, paramsKeyMap:this.paramsKeyMap, statementsKeyMap:this.statementsKeyMap};
  };
  b.appendDummyInput = function() {
    return this;
  };
  b.appendValueInput = function(a) {
    this.def && this.def.index && (void 0 !== this.def.index[a] ? this.definition.params.push(this.def.params[this.def.index[a]]) : this.definition.params.push(null));
    this.params.push({type:"Block", accept:"string"});
    this._addToParamsKeyMap(a);
    this.templates.push(this.getFieldCount());
    return this;
  };
  b.appendStatementInput = function(a) {
    this._addToStatementsKeyMap(a);
    this.statements.push({accept:"basic"});
  };
  b.setCheck = function(a) {
    var b = this.params;
    "Boolean" === a && (b[b.length - 1].accept = "boolean");
  };
  b.appendField = function(a, b) {
    if (!a) {
      return this;
    }
    "string" === typeof a && 0 < a.length ? b ? (a = {type:"Text", text:a, color:b}, this.params.push(a), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0)) : this.templates.push(a) : a.constructor == Blockly.FieldIcon ? ("start" === a.type ? this.params.push({type:"Indicator", img:a.src_, size:17, position:{x:0, y:-2}}) : 
    this.params.push({type:"Indicator", img:a.src_, size:12}), this._addToParamsKeyMap(), this.templates.push(this.getFieldCount()), this.definition && this.definition.params.push(null)) : a.constructor == Blockly.FieldDropdown ? (this.params.push({type:"Dropdown", options:a.menuGenerator_, value:a.menuGenerator_[0][1], fontSize:11}), this._addToParamsKeyMap(b), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : 
    this.definition.params.push(void 0)) : a.constructor == Blockly.FieldDropdownDynamic ? (this.params.push({type:"DropdownDynamic", value:null, menuName:a.menuName_, fontSize:11}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldTextInput ? (this.params.push({type:"TextInput", value:10}), 
    this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldAngle ? (this.params.push({type:"Angle"}), this.templates.push(this.getFieldCount()), this.def && this.def.index && void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(null), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldKeydownInput ? (this.params.push({type:"Keyboard", value:81}), this.templates.push(this.getFieldCount()), 
    void 0 !== this.def.index[b] ? this.definition.params.push(this.def.params[this.def.index[b]]) : this.definition.params.push(void 0), this._addToParamsKeyMap(b)) : a.constructor == Blockly.FieldColour ? (this.params.push({type:"Color"}), this.templates.push(this.getFieldCount()), this._addToParamsKeyMap(b)) : console.log("else", a);
    return this;
  };
  b.setColour = function(a) {
    this.color = a;
  };
  b.setInputsInline = function() {
  };
  b.setOutput = function(a, b) {
    a && (this.output = b);
  };
  b.setPreviousStatement = function(a) {
    this.isPrev = a;
  };
  b.setNextStatement = function(a) {
    this.isNext = a;
  };
  b.setEditable = function(a) {
  };
  b.getFieldCount = function() {
    this.fieldCount++;
    return "%" + this.fieldCount;
  };
  b._addToParamsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.paramsKeyMap;
    b[a] = Object.keys(b).length;
  };
  b._addToStatementsKeyMap = function(a) {
    a = a ? a : "dummy_" + Entry.Utils.generateId();
    var b = this.statementsKeyMap;
    b[a] = Object.keys(b).length;
  };
})(Entry.BlockMockup.prototype);
Entry.ContextMenu = {};
(function(b) {
  b.createDom = function() {
    this.dom = Entry.Dom("ul", {id:"entry-contextmenu", parent:$("body")});
    Entry.Utils.disableContextmenu(this.dom);
    Entry.documentMousedown.attach(this, function() {
      this.hide();
    });
  };
  b.show = function(a, b) {
    this.dom || this.createDom();
    if (0 !== a.length) {
      var c = this;
      void 0 !== b && (this._className = b, this.dom.addClass(b));
      var e = this.dom;
      e.empty();
      for (var f = 0, g = a.length;f < g;f++) {
        var h = a[f], k = h.text, l = !1 !== h.enable, n = Entry.Dom("li", {class:l ? "menuAble" : "menuDisable", parent:e});
        n.text(k);
        l && h.callback && function(a, b) {
          a.mousedown(function(a) {
            a.preventDefault();
            c.hide();
            b(a);
          });
        }(n, h.callback);
      }
      e.removeClass("entryRemove");
      this.position(Entry.mouseCoordinate);
    }
  };
  b.position = function(a) {
    var b = this.dom;
    b.css({left:0, top:0});
    var c = b.width(), e = b.height(), f = $(window), g = f.width(), f = f.height();
    a.x + c > g && (a.x -= c + 3);
    a.y + e > f && (a.y -= e);
    b.css({left:a.x, top:a.y});
  };
  b.hide = function() {
    this.dom.empty();
    this.dom.addClass("entryRemove");
    this._className && (this.dom.removeClass(this._className), delete this._className);
  };
})(Entry.ContextMenu);
Entry.STATIC = {OBJECT:0, ENTITY:1, SPRITE:2, SOUND:3, VARIABLE:4, FUNCTION:5, SCENE:6, MESSAGE:7, BLOCK_MODEL:8, BLOCK_RENDER_MODEL:9, BOX_MODEL:10, THREAD_MODEL:11, DRAG_INSTANCE:12, BLOCK_STATIC:0, BLOCK_MOVE:1, BLOCK_FOLLOW:2, RETURN:0, CONTINUE:1, BREAK:2, PASS:3};
Entry.Utils = {};
Entry.overridePrototype = function() {
  Number.prototype.mod = function(b) {
    return (this % b + b) % b;
  };
};
Entry.Utils.generateId = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.Utils.intersectArray = function(b, a) {
  for (var d = [], c = 0;c < b.length;c++) {
    for (var e = 0;e < a.length;e++) {
      if (b[c] == a[e]) {
        d.push(b[c]);
        break;
      }
    }
  }
  return d;
};
Entry.Utils.isPointInMatrix = function(b, a, d) {
  d = void 0 === d ? 0 : d;
  var c = b.offsetX ? b.x + b.offsetX : b.x, e = b.offsetY ? b.y + b.offsety : b.y;
  return c - d <= a.x && c + b.width + d >= a.x && e - d <= a.y && e + b.height + d >= a.y;
};
Entry.Utils.colorDarken = function(b, a) {
  function d(a) {
    2 != a.length && (a = "0" + a);
    return a;
  }
  var c, e, f;
  7 === b.length ? (c = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(3, 2), 16), f = parseInt(b.substr(5, 2), 16)) : (c = parseInt(b.substr(1, 2), 16), e = parseInt(b.substr(2, 2), 16), f = parseInt(b.substr(3, 2), 16));
  a = void 0 === a ? .7 : a;
  c = d(Math.floor(c * a).toString(16));
  e = d(Math.floor(e * a).toString(16));
  f = d(Math.floor(f * a).toString(16));
  return "#" + c + e + f;
};
Entry.Utils.colorLighten = function(b, a) {
  a = 0 === a ? 0 : a || 20;
  var d = Entry.Utils.hexToHsl(b);
  d.l += a / 100;
  d.l = Math.min(1, Math.max(0, d.l));
  return Entry.Utils.hslToHex(d);
};
Entry.Utils.bound01 = function(b, a) {
  var d = b;
  "string" == typeof d && -1 != d.indexOf(".") && 1 === parseFloat(d) && (b = "100%");
  d = "string" === typeof b && -1 != b.indexOf("%");
  b = Math.min(a, Math.max(0, parseFloat(b)));
  d && (b = parseInt(b * a, 10) / 100);
  return 1E-6 > Math.abs(b - a) ? 1 : b % a / parseFloat(a);
};
Entry.Utils.hexToHsl = function(b) {
  var a, d;
  7 === b.length ? (a = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(3, 2), 16), b = parseInt(b.substr(5, 2), 16)) : (a = parseInt(b.substr(1, 2), 16), d = parseInt(b.substr(2, 2), 16), b = parseInt(b.substr(3, 2), 16));
  a = Entry.Utils.bound01(a, 255);
  d = Entry.Utils.bound01(d, 255);
  b = Entry.Utils.bound01(b, 255);
  var c = Math.max(a, d, b), e = Math.min(a, d, b), f, g = (c + e) / 2;
  if (c == e) {
    f = e = 0;
  } else {
    var h = c - e, e = .5 < g ? h / (2 - c - e) : h / (c + e);
    switch(c) {
      case a:
        f = (d - b) / h + (d < b ? 6 : 0);
        break;
      case d:
        f = (b - a) / h + 2;
        break;
      case b:
        f = (a - d) / h + 4;
    }
    f /= 6;
  }
  return {h:360 * f, s:e, l:g};
};
Entry.Utils.hslToHex = function(b) {
  function a(a, b, d) {
    0 > d && (d += 1);
    1 < d && --d;
    return d < 1 / 6 ? a + 6 * (b - a) * d : .5 > d ? b : d < 2 / 3 ? a + (b - a) * (2 / 3 - d) * 6 : a;
  }
  function d(a) {
    return 1 == a.length ? "0" + a : "" + a;
  }
  var c, e;
  e = Entry.Utils.bound01(b.h, 360);
  c = Entry.Utils.bound01(b.s, 1);
  b = Entry.Utils.bound01(b.l, 1);
  if (0 === c) {
    c = b = e = b;
  } else {
    var f = .5 > b ? b * (1 + c) : b + c - b * c, g = 2 * b - f;
    c = a(g, f, e + 1 / 3);
    b = a(g, f, e);
    e = a(g, f, e - 1 / 3);
  }
  b *= 255;
  e *= 255;
  return "#" + [d(Math.round(255 * c).toString(16)), d(Math.round(b).toString(16)), d(Math.round(e).toString(16))].join("");
};
Entry.Utils.bindGlobalEvent = function(b) {
  var a = $(document);
  void 0 === b && (b = "resize mousedown mousemove keydown keyup dispose".split(" "));
  -1 < b.indexOf("resize") && (Entry.windowReszied && ($(window).off("resize"), Entry.windowReszied.clear()), Entry.windowResized = new Entry.Event(window), $(window).on("resize", function(a) {
    Entry.windowResized.notify(a);
  }));
  -1 < b.indexOf("mousedown") && (Entry.documentMousedown && (a.off("mousedown"), Entry.documentMousedown.clear()), Entry.documentMousedown = new Entry.Event(window), a.on("mousedown", function(a) {
    Entry.documentMousedown.notify(a);
  }));
  -1 < b.indexOf("mousemove") && (Entry.documentMousemove && (a.off("touchmove mousemove"), Entry.documentMousemove.clear()), Entry.mouseCoordinate = {}, Entry.documentMousemove = new Entry.Event(window), a.on("touchmove mousemove", function(a) {
    a.originalEvent && a.originalEvent.touches && (a = a.originalEvent.touches[0]);
    Entry.documentMousemove.notify(a);
    Entry.mouseCoordinate.x = a.clientX;
    Entry.mouseCoordinate.y = a.clientY;
  }));
  -1 < b.indexOf("keydown") && (Entry.keyPressed && (a.off("keydown"), Entry.keyPressed.clear()), Entry.pressedKeys = [], Entry.keyPressed = new Entry.Event(window), a.on("keydown", function(a) {
    var b = a.keyCode;
    0 > Entry.pressedKeys.indexOf(b) && Entry.pressedKeys.push(b);
    Entry.keyPressed.notify(a);
  }));
  -1 < b.indexOf("keyup") && (Entry.keyUpped && (a.off("keyup"), Entry.keyUpped.clear()), Entry.keyUpped = new Entry.Event(window), a.on("keyup", function(a) {
    var b = Entry.pressedKeys.indexOf(a.keyCode);
    -1 < b && Entry.pressedKeys.splice(b, 1);
    Entry.keyUpped.notify(a);
  }));
  -1 < b.indexOf("dispose") && (Entry.disposeEvent && Entry.disposeEvent.clear(), Entry.disposeEvent = new Entry.Event(window), Entry.documentMousedown && Entry.documentMousedown.attach(this, function(a) {
    Entry.disposeEvent.notify(a);
  }));
};
Entry.Utils.makeActivityReporter = function() {
  Entry.activityReporter = new Entry.ActivityReporter;
  return Entry.activityReporter;
};
Entry.Utils.initEntryEvent_ = function() {
  Entry.events_ || (Entry.events_ = []);
};
Entry.sampleColours = [];
Entry.assert = function(b, a) {
  if (!b) {
    throw Error(a || "Assert failed");
  }
};
Entry.parseTexttoXML = function(b) {
  var a;
  window.ActiveXObject ? (a = new ActiveXObject("Microsoft.XMLDOM"), a.async = "false", a.loadXML(b)) : a = (new DOMParser).parseFromString(b, "text/xml");
  return a;
};
Entry.createElement = function(b, a) {
  var d = document.createElement(b);
  a && (d.id = a);
  d.hasClass = function(a) {
    return this.className.match(new RegExp("(\\s|^)" + a + "(\\s|$)"));
  };
  d.addClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) || (this.className += " " + a);
    }
  };
  d.removeClass = function(a) {
    for (var b = 0;b < arguments.length;b++) {
      a = arguments[b], this.hasClass(a) && (this.className = this.className.replace(new RegExp("(\\s|^)" + a + "(\\s|$)"), " "));
    }
  };
  d.bindOnClick = function(a) {
    $(this).on("click tab", function(b) {
      b.stopImmediatePropagation();
      a.call(this, b);
    });
  };
  return d;
};
Entry.makeAutolink = function(b) {
  return b ? b.replace(/(http|https|ftp|telnet|news|irc):\/\/([-/.a-zA-Z0-9_~#%$?&=:200-377()][^)\]}]+)/gi, "<a href='$1://$2' target='_blank'>$1://$2</a>").replace(/([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+.[a-z0-9-]+)/gi, "<a href='mailto:$1'>$1</a>") : "";
};
Entry.generateHash = function() {
  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4);
};
Entry.addEventListener = function(b, a) {
  this.events_ || (this.events_ = {});
  this.events_[b] || (this.events_[b] = []);
  a instanceof Function && this.events_[b].push(a);
  return !0;
};
Entry.dispatchEvent = function(b, a) {
  this.events_ || (this.events_ = {});
  if (this.events_[b]) {
    for (var d = 0, c = this.events_[b].length;d < c;d++) {
      this.events_[b][d].call(window, a);
    }
  }
};
Entry.removeEventListener = function(b, a) {
  if (this.events_[b]) {
    for (var d = 0, c = this.events_[b].length;d < c;d++) {
      if (this.events_[b][d] === a) {
        this.events_[b].splice(d, 1);
        break;
      }
    }
  }
};
Entry.removeAllEventListener = function(b) {
  this.events_ && this.events_[b] && delete this.events_[b];
};
Entry.addTwoNumber = function(b, a) {
  if (isNaN(b) || isNaN(a)) {
    return b + a;
  }
  b += "";
  a += "";
  var d = b.indexOf("."), c = a.indexOf("."), e = 0, f = 0;
  0 < d && (e = b.length - d - 1);
  0 < c && (f = a.length - c - 1);
  return 0 < e || 0 < f ? e >= f ? (parseFloat(b) + parseFloat(a)).toFixed(e) : (parseFloat(b) + parseFloat(a)).toFixed(f) : parseInt(b) + parseInt(a);
};
Entry.hex2rgb = function(b) {
  return (b = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(b)) ? {r:parseInt(b[1], 16), g:parseInt(b[2], 16), b:parseInt(b[3], 16)} : null;
};
Entry.rgb2hex = function(b, a, d) {
  return "#" + (16777216 + (b << 16) + (a << 8) + d).toString(16).slice(1);
};
Entry.generateRgb = function() {
  return {r:Math.floor(256 * Math.random()), g:Math.floor(256 * Math.random()), b:Math.floor(256 * Math.random())};
};
Entry.adjustValueWithMaxMin = function(b, a, d) {
  return b > d ? d : b < a ? a : b;
};
Entry.isExist = function(b, a, d) {
  for (var c = 0;c < d.length;c++) {
    if (d[c][a] == b) {
      return d[c];
    }
  }
  return !1;
};
Entry.getColourCodes = function() {
  return "transparent #660000 #663300 #996633 #003300 #003333 #003399 #000066 #330066 #660066 #FFFFFF #990000 #993300 #CC9900 #006600 #336666 #0033FF #000099 #660099 #990066 #000000 #CC0000 #CC3300 #FFCC00 #009900 #006666 #0066FF #0000CC #663399 #CC0099 #333333 #FF0000 #FF3300 #FFFF00 #00CC00 #009999 #0099FF #0000FF #9900CC #FF0099 #666666 #CC3333 #FF6600 #FFFF33 #00FF00 #00CCCC #00CCFF #3366FF #9933FF #FF00FF #999999 #FF6666 #FF6633 #FFFF66 #66FF66 #66CCCC #00FFFF #3399FF #9966FF #FF66FF #BBBBBB #FF9999 #FF9966 #FFFF99 #99FF99 #66FFCC #99FFFF #66CCff #9999FF #FF99FF #CCCCCC #FFCCCC #FFCC99 #FFFFCC #CCFFCC #99FFCC #CCFFFF #99CCFF #CCCCFF #FFCCFF".split(" ");
};
Entry.removeElement = function(b) {
  b && b.parentNode && b.parentNode.removeChild(b);
};
Entry.getElementsByClassName = function(b) {
  for (var a = [], d = document.getElementsByTagName("*"), c = 0;c < d.length;c++) {
    -1 < (" " + d[c].className + " ").indexOf(" " + b + " ") && a.push(d[c]);
  }
  return a;
};
Entry.parseNumber = function(b) {
  return "string" != typeof b || isNaN(Number(b)) ? "number" != typeof b || isNaN(Number(b)) ? !1 : b : Number(b);
};
Entry.countStringLength = function(b) {
  var a, d = 0;
  for (a = 0;a < b.length;a++) {
    255 < b.charCodeAt(a) ? d += 2 : d++;
  }
  return d;
};
Entry.cutStringByLength = function(b, a) {
  var d, c = 0;
  for (d = 0;c < a && d < b.length;d++) {
    255 < b.charCodeAt(d) ? c += 2 : c++;
  }
  return b.substr(0, d);
};
Entry.isChild = function(b, a) {
  if (!a) {
    for (;a.parentNode;) {
      if ((a = a.parentNode) == b) {
        return !0;
      }
    }
  }
  return !1;
};
Entry.launchFullScreen = function(b) {
  b.requestFullscreen ? b.requestFullscreen() : b.mozRequestFulScreen ? b.mozRequestFulScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullScreen && b.msRequestFullScreen();
};
Entry.exitFullScreen = function() {
  document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
};
Entry.isPhone = function() {
  return !1;
};
Entry.getKeyCodeMap = function() {
  return {65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 32:Lang.Blocks.START_press_some_key_space, 37:Lang.Blocks.START_press_some_key_left, 38:Lang.Blocks.START_press_some_key_up, 39:Lang.Blocks.START_press_some_key_right, 40:Lang.Blocks.START_press_some_key_down, 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
  13:Lang.Blocks.START_press_some_key_enter};
};
Entry.checkCollisionRect = function(b, a) {
  return !(b.y + b.height < a.y || b.y > a.y + a.height || b.x + b.width < a.x || b.x > a.x + a.width);
};
Entry.bindAnimationCallback = function(b, a) {
  b.addEventListener("webkitAnimationEnd", a, !1);
  b.addEventListener("animationend", a, !1);
  b.addEventListener("oanimationend", a, !1);
};
Entry.cloneSimpleObject = function(b) {
  var a = {}, d;
  for (d in b) {
    a[d] = b[d];
  }
  return a;
};
Entry.nodeListToArray = function(b) {
  for (var a = Array(b.length), d = -1, c = b.length;++d !== c;a[d] = b[d]) {
  }
  return a;
};
Entry.computeInputWidth = function(b) {
  var a = document.createElement("span");
  a.className = "tmp-element";
  a.innerHTML = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.appendChild(a);
  b = a.offsetWidth;
  document.body.removeChild(a);
  return Number(b + 10) + "px";
};
Entry.isArrowOrBackspace = function(b) {
  return -1 < [37, 38, 39, 40, 8].indexOf(b);
};
Entry.hexStringToBin = function(b) {
  for (var a = [], d = 0;d < b.length - 1;d += 2) {
    a.push(parseInt(b.substr(d, 2), 16));
  }
  return String.fromCharCode.apply(String, a);
};
Entry.findObjsByKey = function(b, a, d) {
  for (var c = [], e = 0;e < b.length;e++) {
    b[e][a] == d && c.push(b[e]);
  }
  return c;
};
Entry.factorials = [];
Entry.factorial = function(b) {
  return 0 === b || 1 == b ? 1 : 0 < Entry.factorials[b] ? Entry.factorials[b] : Entry.factorials[b] = Entry.factorial(b - 1) * b;
};
Entry.getListRealIndex = function(b, a) {
  if (isNaN(b)) {
    switch(b) {
      case "FIRST":
        b = 1;
        break;
      case "LAST":
        b = a.array_.length;
        break;
      case "RANDOM":
        b = Math.floor(Math.random() * a.array_.length) + 1;
    }
  }
  return b;
};
Entry.toRadian = function(b) {
  return b * Math.PI / 180;
};
Entry.toDegrees = function(b) {
  return 180 * b / Math.PI;
};
Entry.getPicturesJSON = function(b) {
  for (var a = [], d = 0, c = b.length;d < c;d++) {
    var e = b[d], f = {};
    f._id = e._id;
    f.id = e.id;
    f.dimension = e.dimension;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    f.scale = e.scale;
    a.push(f);
  }
  return a;
};
Entry.getSoundsJSON = function(b) {
  for (var a = [], d = 0, c = b.length;d < c;d++) {
    var e = b[d], f = {};
    f._id = e._id;
    f.duration = e.duration;
    f.ext = e.ext;
    f.id = e.id;
    f.filename = e.filename;
    f.fileurl = e.fileurl;
    f.name = e.name;
    a.push(f);
  }
  return a;
};
Entry.cutDecimal = function(b) {
  return Math.round(100 * b) / 100;
};
Entry.getBrowserType = function() {
  if (Entry.userAgent) {
    return Entry.userAgent;
  }
  var b = navigator.userAgent, a, d = b.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(d[1])) {
    return a = /\brv[ :]+(\d+)/g.exec(b) || [], "IE " + (a[1] || "");
  }
  if ("Chrome" === d[1] && (a = b.match(/\b(OPR|Edge)\/(\d+)/), null != a)) {
    return a.slice(1).join(" ").replace("OPR", "Opera");
  }
  d = d[2] ? [d[1], d[2]] : [navigator.appName, navigator.appVersion, "-?"];
  null != (a = b.match(/version\/(\d+)/i)) && d.splice(1, 1, a[1]);
  b = d.join(" ");
  return Entry.userAgent = b;
};
Entry.setBasicBrush = function(b) {
  var a = new createjs.Graphics;
  a.thickness = 1;
  a.rgb = Entry.hex2rgb("#ff0000");
  a.opacity = 100;
  a.setStrokeStyle(1);
  a.beginStroke("rgba(255,0,0,1)");
  var d = new createjs.Shape(a);
  Entry.stage.selectedObjectContainer.addChild(d);
  b.brush && (b.brush = null);
  b.brush = a;
  b.shape && (b.shape = null);
  b.shape = d;
};
Entry.setCloneBrush = function(b, a) {
  var d = new createjs.Graphics;
  d.thickness = a.thickness;
  d.rgb = a.rgb;
  d.opacity = a.opacity;
  d.setStrokeStyle(d.thickness);
  d.beginStroke("rgba(" + d.rgb.r + "," + d.rgb.g + "," + d.rgb.b + "," + d.opacity / 100 + ")");
  var c = new createjs.Shape(d);
  Entry.stage.selectedObjectContainer.addChild(c);
  b.brush && (b.brush = null);
  b.brush = d;
  b.shape && (b.shape = null);
  b.shape = c;
};
Entry.isFloat = function(b) {
  return /\d+\.{1}\d+/.test(b);
};
Entry.getStringIndex = function(b) {
  if (!b) {
    return "";
  }
  for (var a = {string:b, index:1}, d = 0, c = [], e = b.length - 1;0 < e;--e) {
    var f = b.charAt(e);
    if (isNaN(f)) {
      break;
    } else {
      c.unshift(f), d = e;
    }
  }
  0 < d && (a.string = b.substring(0, d), a.index = parseInt(c.join("")) + 1);
  return a;
};
Entry.getOrderedName = function(b, a, d) {
  if (!b) {
    return "untitled";
  }
  if (!a || 0 === a.length) {
    return b;
  }
  d || (d = "name");
  for (var c = 0, e = Entry.getStringIndex(b), f = 0, g = a.length;f < g;f++) {
    var h = Entry.getStringIndex(a[f][d]);
    e.string === h.string && h.index > c && (c = h.index);
  }
  return 0 < c ? e.string + c : b;
};
Entry.changeXmlHashId = function(b) {
  if (/function_field/.test(b.getAttribute("type"))) {
    for (var a = b.getElementsByTagName("mutation"), d = 0, c = a.length;d < c;d++) {
      a[d].setAttribute("hashid", Entry.generateHash());
    }
  }
  return b;
};
Entry.getMaxFloatPoint = function(b) {
  for (var a = 0, d = 0, c = b.length;d < c;d++) {
    var e = String(b[d]), f = e.indexOf(".");
    -1 !== f && (e = e.length - (f + 1), e > a && (a = e));
  }
  return Math.min(a, 20);
};
Entry.convertToRoundedDecimals = function(b, a) {
  return isNaN(b) || !this.isFloat(b) ? b : Number(Math.round(b + "e" + a) + "e-" + a);
};
Entry.attachEventListener = function(b, a, d) {
  setTimeout(function() {
    b.addEventListener(a, d);
  }, 0);
};
Entry.deAttachEventListener = function(b, a, d) {
  b.removeEventListener(a, d);
};
Entry.isEmpty = function(b) {
  if (!b) {
    return !0;
  }
  for (var a in b) {
    if (b.hasOwnProperty(a)) {
      return !1;
    }
  }
  return !0;
};
Entry.Utils.disableContextmenu = function(b) {
  if (b) {
    $(b).on("contextmenu", function(a) {
      a.stopPropagation();
      a.preventDefault();
      return !1;
    });
  }
};
Entry.Utils.isRightButton = function(b) {
  return 2 == b.button || b.ctrlKey;
};
Entry.Utils.isTouchEvent = function(b) {
  return "mousedown" !== b.type.toLowerCase();
};
Entry.Utils.inherit = function(b, a) {
  function d() {
  }
  d.prototype = b.prototype;
  a.prototype = new d;
  return a;
};
Entry.bindAnimationCallbackOnce = function(b, a) {
  b.one("webkitAnimationEnd animationendo animationend", a);
};
Entry.Utils.isInInput = function(b) {
  return "textarea" == b.target.type || "text" == b.target.type;
};
Entry.Utils.isFunction = function(b) {
  return "function" === typeof b;
};
Entry.Utils.addFilters = function(b, a) {
  var d = b.elem("defs"), c = d.elem("filter", {id:"entryTrashcanFilter_" + a});
  c.elem("feGaussianBlur", {"in":"SourceAlpha", stdDeviation:2, result:"blur"});
  c.elem("feOffset", {"in":"blur", dx:1, dy:1, result:"offsetBlur"});
  c = c.elem("feMerge");
  c.elem("feMergeNode", {"in":"offsetBlur"});
  c.elem("feMergeNode", {"in":"SourceGraphic"}, c);
  c = d.elem("filter", {id:"entryBlockShadowFilter_" + a, height:"200%"});
  c.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:1});
  c.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"0.7 0 0 0 0 0 0.7 0 0 0 0 0 0.7 0 0 0 0 0 1 0"});
  c.elem("feBlend", {in:"SourceGraphic", in1:"offOut", mode:"normal"});
  d = d.elem("filter", {id:"entryBlockHighlightFilter_" + a});
  d.elem("feOffset", {result:"offOut", in:"SourceGraphic", dx:0, dy:0});
  d.elem("feColorMatrix", {result:"matrixOut", in:"offOut", type:"matrix", values:"1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0"});
};
Entry.Utils.addBlockPattern = function(b, a) {
  for (var d = b.elem("pattern", {id:"blockHoverPattern_" + a, class:"blockHoverPattern", patternUnits:"userSpaceOnUse", patternTransform:"translate(12, 0)", x:0, y:0, width:125, height:33}).elem("g"), c = d.elem("rect", {x:0, y:0, width:125, height:33}), e = Entry.mediaFilePath + "block_pattern_(order).png", f = 1;5 > f;f++) {
    d.elem("image", {class:"pattern" + f, href:e.replace("(order)", f), x:0, y:0, width:125, height:33});
  }
  return c;
};
Entry.Utils.COLLISION = {NONE:0, UP:1, RIGHT:2, LEFT:3, DOWN:4};
Entry.Utils.createMouseEvent = function(b, a) {
  var d = document.createEvent("MouseEvent");
  d.initMouseEvent(b, !0, !0, window, 0, 0, 0, a.clientX, a.clientY, !1, !1, !1, !1, 0, null);
  return d;
};
Entry.Utils.xmlToJsonData = function(b) {
  b = $.parseXML(b);
  var a = [];
  b = b.childNodes[0].childNodes;
  for (var d in b) {
    var c = b[d];
    if (c.tagName) {
      var e = {category:c.getAttribute("id"), blocks:[]}, c = c.childNodes;
      for (d in c) {
        var f = c[d];
        f.tagName && e.blocks.push(f.getAttribute("type"));
      }
      a.push(e);
    }
  }
  return a;
};
Entry.Utils.stopProjectWithToast = function(b, a) {
  a = a || "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec \ubc1c\uc0dd";
  Entry.toast && Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, !0);
  Entry.engine && Entry.engine.toggleStop();
  "workspace" === Entry.type && (Entry.container.selectObject(b.getCode().object.id), b.view.getBoard().activateBlock(b));
  throw Error(a);
};
Entry.Model = function(b, a) {
  var d = Entry.Model;
  d.generateSchema(b);
  d.generateSetter(b);
  d.generateObserve(b);
  (void 0 === a || a) && Object.seal(b);
  return b;
};
(function(b) {
  b.generateSchema = function(a) {
    var b = a.schema;
    if (void 0 !== b) {
      b = JSON.parse(JSON.stringify(b));
      a.data = {};
      for (var c in b) {
        (function(c) {
          a.data[c] = b[c];
          Object.defineProperty(a, c, {get:function() {
            return a.data[c];
          }});
        })(c);
      }
      a._toJSON = this._toJSON;
    }
  };
  b.generateSetter = function(a) {
    a.set = this.set;
  };
  b.set = function(a, b) {
    var c = {}, e;
    for (e in this.data) {
      void 0 !== a[e] && (a[e] === this.data[e] ? delete a[e] : (c[e] = this.data[e], this.data[e] = a[e] instanceof Array ? a[e].concat() : a[e]));
    }
    b || this.notify(Object.keys(a), c);
  };
  b.generateObserve = function(a) {
    a.observers = [];
    a.observe = this.observe;
    a.unobserve = this.unobserve;
    a.notify = this.notify;
  };
  b.observe = function(a, b, c, e) {
    c = new Entry.Observer(this.observers, a, b, c);
    if (!1 !== e) {
      a[b]([]);
    }
    return c;
  };
  b.unobserve = function(a) {
    a.destroy();
  };
  b.notify = function(a, b) {
    "string" === typeof a && (a = [a]);
    var c = this;
    c.observers.map(function(e) {
      var f = a;
      void 0 !== e.attrs && (f = Entry.Utils.intersectArray(e.attrs, a));
      if (f.length) {
        e.object[e.funcName](f.map(function(a) {
          return {name:a, object:c, oldValue:b[a]};
        }));
      }
    });
  };
  b._toJSON = function() {
    var a = {}, b;
    for (b in this.data) {
      a[b] = this.data[b];
    }
    return a;
  };
})(Entry.Model);
Entry.Func = function(b) {
  this.id = b ? b.id : Entry.generateHash();
  this.content = b ? new Entry.Code(b.content) : new Entry.Code([[{type:"function_create", copyable:!1, deletable:!1, x:40, y:40}]]);
  this.block = null;
  this.hashMap = {};
  this.paramMap = {};
  var a = function() {
  };
  a.prototype = Entry.block.function_general;
  a = new a;
  a.changeEvent = new Entry.Event;
  a.template = Lang.template.function_general;
  Entry.block["func_" + this.id] = a;
  if (b) {
    b = this.content._blockMap;
    for (var d in b) {
      Entry.Func.registerParamBlock(b[d].type);
    }
    Entry.Func.generateWsBlock(this);
  }
  Entry.Func.registerFunction(this);
  Entry.Func.updateMenu();
};
Entry.Func.threads = {};
Entry.Func.registerFunction = function(b) {
  var a = Entry.playground.mainWorkspace;
  a && (this._targetFuncBlock = a.getBlockMenu().getCategoryCodes("func").createThread([{type:"func_" + b.id}]));
};
Entry.Func.executeFunction = function(b) {
  var a = this.threads[b];
  if (a = Entry.Engine.computeThread(a.entity, a)) {
    return this.threads[b] = a, !0;
  }
  delete this.threads[b];
  return !1;
};
Entry.Func.clearThreads = function() {
  this.threads = {};
};
Entry.Func.prototype.init = function(b) {
  this.id = b.id;
  this.content = Blockly.Xml.textToDom(b.content);
  this.block = Blockly.Xml.textToDom("<xml>" + b.block + "</xml>").childNodes[0];
};
Entry.Func.edit = function(b) {
  this.cancelEdit();
  this.targetFunc = b;
  this.initEditView(b.content);
  this.bindFuncChangeEvent();
  this.updateMenu();
};
Entry.Func.initEditView = function(b) {
  this.menuCode || this.setupMenuCode();
  var a = Entry.playground.mainWorkspace;
  a.setMode(Entry.Workspace.MODE_OVERLAYBOARD);
  a.changeOverlayBoardCode(b);
  this._workspaceStateEvent = a.changeEvent.attach(this, this.endEdit);
};
Entry.Func.endEdit = function(b) {
  this.unbindFuncChangeEvent();
  this._workspaceStateEvent.destroy();
  delete this._workspaceStateEvent;
  switch(b) {
    case "save":
      this.save();
    case "cancelEdit":
      this.cancelEdit();
  }
};
Entry.Func.save = function() {
  this.targetFunc.generateBlock(!0);
  Entry.variableContainer.saveFunction(this.targetFunc);
};
Entry.Func.syncFuncName = function(b) {
  var a = 0, d = [], d = b.split(" "), c = "";
  b = [];
  b = Blockly.mainWorkspace.getAllBlocks();
  for (var e = 0;e < b.length;e++) {
    var f = b[e];
    if ("function_general" === f.type) {
      for (var g = [], g = f.inputList, h = 0;h < g.length;h++) {
        f = g[h], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_ && (c += f.fieldRow[0].text_, c += " ");
      }
      c = c.trim();
      if (c === this.srcFName && this.srcFName.split(" ").length == d.length) {
        for (c = 0;c < g.length;c++) {
          if (f = g[c], 0 < f.fieldRow.length && f.fieldRow[0] instanceof Blockly.FieldLabel && void 0 != f.fieldRow[0].text_) {
            if (void 0 === d[a]) {
              g.splice(c, 1);
              break;
            } else {
              f.fieldRow[0].text_ = d[a];
            }
            a++;
          }
        }
      }
      c = "";
      a = 0;
    }
  }
  a = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  Blockly.mainWorkspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, a);
};
Entry.Func.cancelEdit = function() {
  this.targetFunc && (Entry.Func.isEdit = !1, this.targetFunc.block || (this._targetFuncBlock.destroy(), delete Entry.variableContainer.functions_[this.targetFunc.id], delete Entry.variableContainer.selected), delete this.targetFunc, this.updateMenu(), Entry.variableContainer.updateList(), Entry.playground.mainWorkspace.setMode(Entry.Workspace.MODE_BOARD));
};
Entry.Func.getMenuXml = function() {
  var b = [];
  this.targetFunc || (b = b.concat(this.createBtn));
  if (this.targetFunc) {
    var a = this.FIELD_BLOCK, a = a.replace("#1", Entry.generateHash()), a = a.replace("#2", Entry.generateHash()), a = Blockly.Xml.textToDom(a).childNodes, b = b.concat(Entry.nodeListToArray(a))
  }
  for (var d in Entry.variableContainer.functions_) {
    a = Entry.variableContainer.functions_[d], a === this.targetFunc ? (a = Entry.Func.generateBlock(this.targetFunc, Blockly.Xml.workspaceToDom(Entry.Func.workspace), a.id).block, b.push(a)) : b.push(a.block);
  }
  return b;
};
Entry.Func.syncFunc = function() {
  var b = Entry.Func;
  if (b.targetFunc) {
    var a = b.workspace.topBlocks_[0].toString(), d = b.workspace.topBlocks_.length;
    (b.fieldText != a || b.workspaceLength != d) && 1 > Blockly.Block.dragMode_ && (b.updateMenu(), b.fieldText = a, b.workspaceLength = d);
  }
};
Entry.Func.setupMenuCode = function() {
  var b = Entry.playground.mainWorkspace;
  b && (b = b.getBlockMenu().getCategoryCodes("func"), this._fieldLabel = b.createThread([{type:"function_field_label"}]).getFirstBlock(), this._fieldString = b.createThread([{type:"function_field_string", params:[{type:this.requestParamBlock("string")}]}]).getFirstBlock(), this._fieldBoolean = b.createThread([{type:"function_field_boolean", params:[{type:this.requestParamBlock("boolean")}]}]).getFirstBlock(), this.menuCode = b);
};
Entry.Func.refreshMenuCode = function() {
  if (Entry.playground.mainWorkspace) {
    this.menuCode || this.setupMenuCode();
    var b = Entry.block[this._fieldString.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldString.params[0].changeType(this.requestParamBlock("string"));
    b = Entry.block[this._fieldBoolean.params[0].type].changeEvent._listeners.length;
    2 < b && this._fieldBoolean.params[0].changeType(this.requestParamBlock("boolean"));
  }
};
Entry.Func.requestParamBlock = function(b) {
  var a = Entry.generateHash(), d;
  switch(b) {
    case "string":
      d = Entry.block.function_param_string;
      break;
    case "boolean":
      d = Entry.block.function_param_boolean;
      break;
    default:
      return null;
  }
  a = b + "Param_" + a;
  b = Entry.Func.createParamBlock(a, d, b);
  Entry.block[a] = b;
  return a;
};
Entry.Func.registerParamBlock = function(b) {
  -1 < b.indexOf("stringParam") ? Entry.Func.createParamBlock(b, Entry.block.function_param_string, b) : -1 < b.indexOf("booleanParam") && Entry.Func.createParamBlock(b, Entry.block.function_param_boolean, b);
};
Entry.Func.createParamBlock = function(b, a, d) {
  var c = function() {
  };
  d = "string" === d ? "function_param_string" : "function_param_boolean";
  c.prototype = a;
  c = new c;
  c.changeEvent = new Entry.Event;
  c.template = Lang.template[d];
  return Entry.block[b] = c;
};
Entry.Func.updateMenu = function() {
  var b = Entry.playground.mainWorkspace;
  b && (b = b.getBlockMenu(), this.targetFunc ? (this.menuCode || this.setupMenuCode(), b.banClass("functionInit"), b.unbanClass("functionEdit")) : (b.unbanClass("functionInit"), b.banClass("functionEdit")), b.reDraw());
};
Entry.Func.prototype.edit = function() {
  Entry.Func.isEdit || (Entry.Func.isEdit = !0, Entry.Func.svg ? this.parentView.appendChild(this.svg) : Entry.Func.initEditView());
};
Entry.Func.generateBlock = function(b) {
  b = Entry.block["func_" + b.id];
  var a = {template:b.template, params:b.params}, d = /(%\d)/mi, c = b.template.split(d), e = "", f = 0, g = 0, h;
  for (h in c) {
    var k = c[h];
    d.test(k) ? (k = Number(k.split("%")[1]) - 1, k = b.params[k], "Indicator" !== k.type && ("boolean" === k.accept ? (e += Lang.template.function_param_boolean + (f ? f : ""), f++) : (e += Lang.General.param_string + (g ? g : ""), g++))) : e += k;
  }
  return {block:a, description:e};
};
Entry.Func.prototype.generateBlock = function(b) {
  b = Entry.Func.generateBlock(this);
  this.block = b.block;
  this.description = b.description;
};
Entry.Func.generateWsBlock = function(b) {
  this.unbindFuncChangeEvent();
  b = b ? b : this.targetFunc;
  for (var a = b.content.getEventMap("funcDef")[0].params[0], d = 0, c = 0, e = [], f = "", g = b.hashMap, h = b.paramMap;a;) {
    var k = a.params[0];
    switch(a.type) {
      case "function_field_label":
        f = f + " " + k;
        break;
      case "function_field_boolean":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_logical_variable + " " + (d ? d : "")});
        g[k.type] = !1;
        h[k.type] = d + c;
        d++;
        e.push({type:"Block", accept:"boolean"});
        f += " %" + (d + c);
        break;
      case "function_field_string":
        Entry.Mutator.mutate(k.type, {template:Lang.Blocks.FUNCTION_character_variable + " " + (c ? c : "")}), g[k.type] = !1, h[k.type] = d + c, c++, f += " %" + (d + c), e.push({type:"Block", accept:"string"});
    }
    a = a.getOutputBlock();
  }
  d++;
  f += " %" + (d + c);
  e.push({type:"Indicator", img:"block_icon/function_03.png", size:12});
  Entry.Mutator.mutate("func_" + b.id, {params:e, template:f});
  for (var l in g) {
    g[l] ? (a = -1 < l.indexOf("string") ? Lang.Blocks.FUNCTION_character_variable : Lang.Blocks.FUNCTION_logical_variable, Entry.Mutator.mutate(l, {template:a})) : g[l] = !0;
  }
  this.bindFuncChangeEvent(b);
};
Entry.Func.bindFuncChangeEvent = function(b) {
  b = b ? b : this.targetFunc;
  !this._funcChangeEvent && b.content.getEventMap("funcDef")[0].view && (this._funcChangeEvent = b.content.getEventMap("funcDef")[0].view._contents[1].changeEvent.attach(this, this.generateWsBlock));
};
Entry.Func.unbindFuncChangeEvent = function() {
  this._funcChangeEvent && this._funcChangeEvent.destroy();
  delete this._funcChangeEvent;
};
Entry.HWMontior = {};
Entry.HWMonitor = function(b) {
  this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  this._hwModule = b;
  var a = this;
  Entry.addEventListener("windowResized", function() {
    var b = a._hwModule.monitorTemplate.mode;
    "both" == b && (a.resize(), a.resizeList());
    "list" == b ? a.resizeList() : a.resize();
  });
  Entry.addEventListener("hwModeChange", function() {
    a.changeMode();
  });
  this.changeOffset = 0;
  this.scale = .5;
  this._listPortViews = {};
};
(function(b) {
  b.initView = function() {
    this.svgDom = Entry.Dom($('<svg id="hwMonitor" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'));
  };
  b.generateView = function() {
    this.snap = Entry.SVG("hwMonitor");
    this._svgGroup = this.snap.elem("g");
    this._portMap = {n:[], e:[], s:[], w:[]};
    var a = this._hwModule.monitorTemplate, b = {href:Entry.mediaFilePath + a.imgPath, x:-a.width / 2, y:-a.height / 2, width:a.width, height:a.height};
    this._portViews = {};
    this.hwView = this._svgGroup.elem("image");
    this.hwView = this.hwView.attr(b);
    this._template = a;
    a = a.ports;
    this.pathGroup = null;
    this.pathGroup = this._svgGroup.elem("g");
    var b = [], c;
    for (c in a) {
      var e = this.generatePortView(a[c], "_svgGroup");
      this._portViews[c] = e;
      b.push(e);
    }
    b.sort(function(a, b) {
      return a.box.x - b.box.x;
    });
    var f = this._portMap;
    b.map(function(a) {
      (1 > (Math.atan2(-a.box.y, a.box.x) / Math.PI + 2) % 2 ? f.n : f.s).push(a);
    });
    this.resize();
  };
  b.toggleMode = function(a) {
    var b = this._hwModule.monitorTemplate;
    "list" == a ? (b.TempPort = null, this._hwModule.monitorTemplate.ports && (this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports, this._hwModule.monitorTemplate.listPorts = this.addPortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._svgGroup && $(this._svgGroup).remove(), $(this._pathGroup).remove(), this._hwModule.monitorTemplate.mode = "list", this.generateListView()) : (this._hwModule.monitorTemplate.TempPort && 
    (this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort, this._hwModule.monitorTemplate.listPorts = this.removePortEle(this._hwModule.monitorTemplate.listPorts, this._hwModule.monitorTemplate.ports)), $(this._svglistGroup).remove(), this._hwModule.monitorTemplate.mode = "both", this.generateListView(), this.generateView());
  };
  b.setHwmonitor = function(a) {
    this._hwmodule = a;
  };
  b.changeMode = function(a) {
    "both" == this._hwModule.monitorTemplate.mode ? this.toggleMode("list") : "list" == this._hwModule.monitorTemplate.mode && this.toggleMode("both");
  };
  b.addPortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var c in b) {
      a[c] = b[c];
    }
    return a;
  };
  b.removePortEle = function(a, b) {
    if ("object" != typeof b) {
      return a;
    }
    for (var c in b) {
      delete a[c];
    }
    return a;
  };
  b.generateListView = function() {
    this._portMapList = {n:[]};
    this._svglistGroup = null;
    this.listsnap = Entry.SVG("hwMonitor");
    this._svglistGroup = this.listsnap.elem("g");
    var a = this._hwModule.monitorTemplate;
    this._template = a;
    a = a.listPorts;
    this.pathGroup = this._svglistGroup.elem("g");
    var b = [], c;
    for (c in a) {
      var e = this.generatePortView(a[c], "_svglistGroup");
      this._listPortViews[c] = e;
      b.push(e);
    }
    var f = this._portMapList;
    b.map(function(a) {
      f.n.push(a);
    });
    this.resizeList();
  };
  b.generatePortView = function(a, b) {
    var c = this[b].elem("g");
    c.addClass("hwComponent");
    var e = null, e = this.pathGroup.elem("path").attr({d:"m0,0", fill:"none", stroke:"input" === a.type ? "#00979d" : "#A751E3", "stroke-width":3}), f = c.elem("rect").attr({x:0, y:0, width:150, height:22, rx:4, ry:4, fill:"#fff", stroke:"#a0a1a1"}), g = c.elem("text").attr({x:4, y:12, fill:"#000", "class":"hwComponentName", "alignment-baseline":"central"});
    g.textContent = a.name;
    g = g.getComputedTextLength();
    c.elem("rect").attr({x:g + 8, y:2, width:30, height:18, rx:9, ry:9, fill:"input" === a.type ? "#00979d" : "#A751E3"});
    var h = c.elem("text").attr({x:g + 13, y:12, fill:"#fff", "class":"hwComponentValue", "alignment-baseline":"central"});
    h.textContent = 0;
    g += 40;
    f.attr({width:g});
    return {group:c, value:h, type:a.type, path:e, box:{x:a.pos.x - this._template.width / 2, y:a.pos.y - this._template.height / 2, width:g}, width:g};
  };
  b.getView = function() {
    return this.svgDom;
  };
  b.update = function() {
    var a = Entry.hw.portData, b = Entry.hw.sendQueue, c = this._hwModule.monitorTemplate.mode, e = [];
    if ("list" == c) {
      e = this._listPortViews;
    } else {
      if ("both" == c) {
        if (e = this._listPortViews, this._portViews) {
          for (var f in this._portViews) {
            e[f] = this._portViews[f];
          }
        }
      } else {
        e = this._portViews;
      }
    }
    if (b) {
      for (f in b) {
        0 != b[f] && e[f] && (e[f].type = "output");
      }
    }
    for (var g in e) {
      c = e[g], "input" == c.type ? (f = a[g], c.value.textContent = f ? f : 0, c.group.getElementsByTagName("rect")[1].attr({fill:"#00979D"})) : (f = b[g], c.value.textContent = f ? f : 0, c.group.getElementsByTagName("rect")[1].attr({fill:"#A751E3"}));
    }
  };
  b.resize = function() {
    this.hwView && this.hwView.attr({transform:"scale(" + this.scale + ")"});
    if (this.svgDom) {
      var a = this.svgDom.get(0).getBoundingClientRect()
    }
    this._svgGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 1.8 + ")"});
    this._rect = a;
    0 >= this._template.height || 0 >= a.height || (this.scale = a.height / this._template.height * this._template.height / 1E3, this.align());
  };
  b.resizeList = function() {
    var a = this.svgDom.get(0).getBoundingClientRect();
    this._svglistGroup.attr({transform:"translate(" + a.width / 2 + "," + a.height / 2 + ")"});
    this._rect = a;
    this.alignList();
  };
  b.align = function() {
    var a = [], a = this._portMap.s.concat();
    this._alignNS(a, this.scale / 3 * this._template.height + 5, 27);
    a = this._portMap.n.concat();
    this._alignNS(a, -this._template.height * this.scale / 3 - 32, -27);
    a = this._portMap.e.concat();
    this._alignEW(a, -this._template.width * this.scale / 3 - 5, -27);
    a = this._portMap.w.concat();
    this._alignEW(a, this._template.width * this.scale / 3 - 32, -27);
  };
  b.alignList = function() {
    for (var a = {}, a = this._hwModule.monitorTemplate.listPorts, b = a.length, c = 0;c < a.length;c++) {
      a[c].group.attr({transform:"translate(" + this._template.width * (c / b - .5) + "," + (-this._template.width / 2 - 30) + ")"});
    }
    a = this._portMapList.n.concat();
    this._alignNSList(a, -this._template.width * this.scale / 2 - 32, -27);
  };
  b._alignEW = function(a, b, c) {
    var e = a.length, f = this._rect.height - 50;
    tP = -f / 2;
    bP = f / 2;
    height = this._rect.height;
    listVLine = wholeHeight = 0;
    mode = this._hwModule.monitorTemplate;
    for (f = 0;f < e;f++) {
      wholeHeight += a[f].height + 5;
    }
    wholeHeight < bP - tP && (bP = wholeHeight / 2 + 3, tP = -wholeHeight / 2 - 3);
    for (;1 < e;) {
      var g = a.shift(), f = a.pop(), h = tP, k = bP, l = c;
      wholeWidth <= bP - tP ? (tP += g.width + 5, bP -= f.width + 5, l = 0) : 0 === a.length ? (tP = (tP + bP) / 2 - 3, bP = tP + 6) : (tP = Math.max(tP, -width / 2 + g.width) + 15, bP = Math.min(bP, width / 2 - f.width) - 15);
      wholeWidth -= g.width + f.width + 10;
      b += l;
    }
    a.length && a[0].group.attr({transform:"translate(" + b + ",60)"});
    g && rPort && (this._movePort(g, b, tP, h), this._movePort(rPort, b, bP, k));
  };
  b._alignNS = function(a, b, c) {
    for (var e = -this._rect.width / 2, f = this._rect.width / 2, g = this._rect.width, h = 0, k = 0;k < a.length;k++) {
      h += a[k].width + 5;
    }
    h < f - e && (f = h / 2 + 3, e = -h / 2 - 3);
    for (;1 < a.length;) {
      var k = a.shift(), l = a.pop(), n = e, m = f, q = c;
      h <= f - e ? (e += k.width + 5, f -= l.width + 5, q = 0) : 0 === a.length ? (e = (e + f) / 2 - 3, f = e + 6) : (e = Math.max(e, -g / 2 + k.width) + 15, f = Math.min(f, g / 2 - l.width) - 15);
      this._movePort(k, e, b, n);
      this._movePort(l, f, b, m);
      h -= k.width + l.width + 10;
      b += q;
    }
    a.length && this._movePort(a[0], (f + e - a[0].width) / 2, b, 100);
  };
  b._alignNSList = function(a, b) {
    var c = this._rect.width;
    initX = -this._rect.width / 2 + 10;
    initY = -this._rect.height / 2 + 10;
    for (var e = listLine = wholeWidth = 0;e < a.length;e++) {
      wholeWidth += a[e].width;
    }
    for (var f = 0, g = 0, h = initX, k = 0, l = 0, n = 0, e = 0;e < a.length;e++) {
      l = a[e], e != a.length - 1 && (n = a[e + 1]), g += l.width, lP = initX, k = initY + 30 * f, l.group.attr({transform:"translate(" + lP + "," + k + ")"}), initX += l.width + 10, g > c - (l.width + n.width / 2.2) && (f += 1, initX = h, g = 0);
    }
  };
  b._movePort = function(a, b, c, e) {
    var f = b, g = a.box.x * this.scale, h = a.box.y * this.scale;
    b > e ? (f = b - a.width, b = b > g && g > e ? "M" + g + "," + c + "L" + g + "," + h : "M" + (b + e) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h) : b = b < g && g < e ? "m" + g + "," + c + "L" + g + "," + h : "m" + (e + b) / 2 + "," + c + "l0," + (h > c ? 28 : -3) + "H" + g + "L" + g + "," + h;
    a.group.attr({transform:"translate(" + f + "," + c + ")"});
    a.path.attr({d:b});
  };
})(Entry.HWMonitor.prototype);
Entry.HW = function() {
  this.connectTrial = 0;
  this.isFirstConnect = !0;
  this.initSocket();
  this.connected = !1;
  this.portData = {};
  this.sendQueue = {};
  this.outputQueue = {};
  this.settingQueue = {};
  this.socketType = this.hwModule = this.selectedDevice = null;
  Entry.addEventListener("stop", this.setZero);
  this.hwInfo = {11:Entry.Arduino, 12:Entry.SensorBoard, 13:Entry.CODEino, 15:Entry.dplay, 16:Entry.nemoino, 17:Entry.Xbot, 24:Entry.Hamster, 25:Entry.Albert, 31:Entry.Bitbrick, 42:Entry.Arduino, 51:Entry.Neobot, 71:Entry.Robotis_carCont, 72:Entry.Robotis_openCM70};
  this.checkOldHardwareProgram = this.checkFirstAlertMsg = !1;
};
Entry.HW.TRIAL_LIMIT = 1;
p = Entry.HW.prototype;
p.initSocket = function() {
  try {
    if (this.connectTrial >= Entry.HW.TRIAL_LIMIT) {
      this.isFirstConnect || Entry.toast.alert(Lang.Menus.connect_hw, Lang.Menus.connect_fail, !1), this.isFirstConnect = !1;
    } else {
      var b = this, a, d;
      this.connected = !1;
      this.connectTrial++;
      if (-1 < location.protocol.indexOf("https")) {
        d = new WebSocket("wss://hardware.play-entry.org:23518");
      } else {
        try {
          a = new WebSocket("ws://127.0.0.1:23518"), a.binaryType = "arraybuffer", a.onopen = function() {
            this.checkOldHardwareProgram = !0;
            b.socketType = "WebSocket";
            b.initHardware(a);
          }.bind(this), a.onmessage = function(a) {
            a = JSON.parse(a.data);
            b.checkDevice(a);
            b.updatePortData(a);
          }.bind(this), a.onclose = function() {
            "WebSocket" === b.socketType && (this.socket = null, b.initSocket());
          };
        } catch (c) {
        }
        try {
          d = new WebSocket("wss://hardware.play-entry.org:23518");
        } catch (c) {
        }
      }
      d.binaryType = "arraybuffer";
      d.onopen = function() {
        b.socketType = "WebSocketSecurity";
        b.initHardware(d);
      };
      d.onmessage = function(a) {
        a = JSON.parse(a.data);
        b.checkDevice(a);
        b.updatePortData(a);
      };
      d.onclose = function() {
        "WebSocketSecurity" === b.socketType && (this.socket = null, b.initSocket());
      };
      Entry.dispatchEvent("hwChanged");
    }
  } catch (c) {
  }
};
p.retryConnect = function() {
  this.connectTrial = 0;
  this.initSocket();
};
p.initHardware = function(b) {
  this.socket = b;
  this.connectTrial = 0;
  this.connected = !0;
  Entry.dispatchEvent("hwChanged");
  Entry.playground && Entry.playground.object && Entry.playground.setMenu(Entry.playground.object.objectType);
};
p.setDigitalPortValue = function(b, a) {
  this.sendQueue[b] = a;
  this.removePortReadable(b);
};
p.getAnalogPortValue = function(b) {
  return this.connected ? this.portData["a" + b] : 0;
};
p.getDigitalPortValue = function(b) {
  if (!this.connected) {
    return 0;
  }
  this.setPortReadable(b);
  return void 0 !== this.portData[b] ? this.portData[b] : 0;
};
p.setPortReadable = function(b) {
  this.sendQueue.readablePorts || (this.sendQueue.readablePorts = []);
  var a = !1, d;
  for (d in this.sendQueue.readablePorts) {
    if (this.sendQueue.readablePorts[d] == b) {
      a = !0;
      break;
    }
  }
  a || this.sendQueue.readablePorts.push(b);
};
p.removePortReadable = function(b) {
  if (this.sendQueue.readablePorts || Array.isArray(this.sendQueue.readablePorts)) {
    var a, d;
    for (d in this.sendQueue.readablePorts) {
      if (this.sendQueue.readablePorts[d] == b) {
        a = Number(d);
        break;
      }
    }
    this.sendQueue.readablePorts = void 0 != a ? this.sendQueue.readablePorts.slice(0, a).concat(this.sendQueue.readablePorts.slice(a + 1, this.sendQueue.readablePorts.length)) : [];
  }
};
p.update = function() {
  this.socket && 1 == this.socket.readyState && (!this.checkFirstAlertMsg && this.checkOldHardwareProgram && (alert(Lang.Workspace.hardware_version_alert_text), this.checkFirstAlertMsg = !0), this.socket.send(JSON.stringify(this.sendQueue)));
};
p.updatePortData = function(b) {
  this.portData = b;
  this.hwMonitor && this.hwMonitor.update();
};
p.closeConnection = function() {
  this.socket && this.socket.close();
};
p.downloadConnector = function() {
  window.open("http://download.play-entry.org/apps/Entry_HW_1.5.2.exe", "_blank").focus();
};
p.downloadSource = function() {
  window.open("http://play-entry.com/down/board.ino", "_blank").focus();
};
p.setZero = function() {
  Entry.hw.hwModule && Entry.hw.hwModule.setZero();
};
p.checkDevice = function(b) {
  void 0 !== b.company && (b = "" + b.company + b.model, b != this.selectedDevice && (this.selectedDevice = b, this.hwModule = this.hwInfo[b], Entry.dispatchEvent("hwChanged"), Entry.toast.success("\ud558\ub4dc\uc6e8\uc5b4 \uc5f0\uacb0 \uc131\uacf5", "\ud558\ub4dc\uc6e8\uc5b4 \uc544\uc774\ucf58\uc744 \ub354\ube14\ud074\ub9ad\ud558\uba74, \uc13c\uc11c\uac12\ub9cc \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", !0), this.hwModule.monitorTemplate && (this.hwMonitor ? (this.hwMonitor._hwModule = 
  this.hwModule, this.hwMonitor.initView()) : this.hwMonitor = new Entry.HWMonitor(this.hwModule), Entry.propertyPanel.addMode("hw", this.hwMonitor), b = this.hwModule.monitorTemplate, "both" == b.mode ? (b.mode = "list", this.hwMonitor.generateListView(), b.mode = "general", this.hwMonitor.generateView(), b.mode = "both") : "list" == b.mode ? this.hwMonitor.generateListView() : this.hwMonitor.generateView())));
};
p.banHW = function() {
  var b = this.hwInfo, a;
  for (a in b) {
    Entry.playground.mainWorkspace.blockMenu.banClass(b[a].name);
  }
};
Entry.BlockModel = function() {
  Entry.Model(this);
};
Entry.BlockModel.prototype.schema = {id:null, x:0, y:0, type:null, params:{}, statements:{}, prev:null, next:null, view:null};
Entry.BlockRenderModel = function() {
  Entry.Model(this);
};
Entry.BlockRenderModel.prototype.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, width:0, height:0, magneting:!1};
Entry.BoxModel = function() {
  Entry.Model(this);
};
Entry.BoxModel.prototype.schema = {id:0, type:Entry.STATIC.BOX_MODEL, x:0, y:0, width:0, height:0};
Entry.DragInstance = function(b) {
  Entry.Model(this);
  this.set(b);
};
Entry.DragInstance.prototype.schema = {type:Entry.STATIC.DRAG_INSTANCE, startX:0, startY:0, offsetX:0, offsetY:0, absX:0, absY:0, prev:null, height:0, mode:0, isNew:!1};
Entry.ThreadModel = function() {
  Entry.Model(this);
};
Entry.ThreadModel.prototype.schema = {id:0, type:Entry.STATIC.THREAD_MODEL, x:0, y:0, width:0, minWidth:0, height:0};
Entry.Variable = function(b) {
  Entry.assert("string" == typeof b.name, "Variable name must be given");
  this.name_ = b.name;
  this.id_ = b.id ? b.id : Entry.generateHash();
  this.type = b.variableType ? b.variableType : "variable";
  this.object_ = b.object || null;
  this.isCloud_ = b.isCloud || !1;
  var a = Entry.parseNumber(b.value);
  this.value_ = "number" == typeof a ? a : b.value ? b.value : 0;
  "slide" == this.type && (this.minValue_ = Number(b.minValue ? b.minValue : 0), this.maxValue_ = Number(b.maxValue ? b.maxValue : 100));
  b.isClone || (this.visible_ = b.visible || "boolean" == typeof b.visible ? b.visible : !0, this.x_ = b.x ? b.x : null, this.y_ = b.y ? b.y : null, "list" == this.type && (this.width_ = b.width ? b.width : 100, this.height_ = b.height ? b.height : 120, this.array_ = b.array ? b.array : [], this.scrollPosition = 0), this.BORDER = 6, this.FONT = "10pt NanumGothic");
};
Entry.Variable.prototype.generateView = function(b) {
  var a = this.type;
  if ("variable" == a || "timer" == a || "answer" == a) {
    this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.wrapper_ = new createjs.Shape, this.view_.addChild(this.wrapper_), this.textView_ = new createjs.Text("asdf", this.FONT, "#000000"), this.textView_.textBaseline = "alphabetic", this.textView_.x = 4, this.textView_.y = 1, this.view_.addChild(this.textView_), this.valueView_ = new createjs.Text("asdf", "10pt NanumGothic", "#ffffff"), this.valueView_.textBaseline = 
    "alphabetic", a = Entry.variableContainer.variables_.length, this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11))), this.view_.visible = this.visible_, this.view_.addChild(this.valueView_), this.view_.on("mousedown", function(a) {
      "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
    }), this.view_.on("pressmove", function(a) {
      "workspace" == Entry.type && (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
    });
  } else {
    if ("slide" == a) {
      var d = this;
      this.view_ = new createjs.Container;
      this.rect_ = new createjs.Shape;
      this.view_.addChild(this.rect_);
      this.view_.variable = this;
      this.wrapper_ = new createjs.Shape;
      this.view_.addChild(this.wrapper_);
      this.textView_ = new createjs.Text("name", this.FONT, "#000000");
      this.textView_.textBaseline = "alphabetic";
      this.textView_.x = 4;
      this.textView_.y = 1;
      this.view_.addChild(this.textView_);
      this.valueView_ = new createjs.Text("value", "10pt NanumGothic", "#ffffff");
      this.valueView_.textBaseline = "alphabetic";
      this.view_.on("mousedown", function(a) {
        "workspace" == Entry.type && (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)});
      });
      this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || d.isAdjusting || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      });
      this.view_.visible = this.visible_;
      this.view_.addChild(this.valueView_);
      a = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26;
      a = Math.max(a, 90);
      this.maxWidth = a - 20;
      this.slideBar_ = new createjs.Shape;
      this.slideBar_.graphics.beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 10, this.maxWidth, 1.5);
      this.view_.addChild(this.slideBar_);
      a = this.getSlidePosition(this.maxWidth);
      this.valueSetter_ = new createjs.Shape;
      this.valueSetter_.graphics.beginFill("#1bafea").s("#A0A1A1").ss(1).dc(a, 10.5, 3);
      this.valueSetter_.cursor = "pointer";
      this.valueSetter_.on("mousedown", function(a) {
        Entry.engine.isState("run") && (d.isAdjusting = !0, this.offsetX = -(this.x - .75 * a.stageX + 240));
      });
      this.valueSetter_.on("pressmove", function(a) {
        if (Entry.engine.isState("run")) {
          var b = .75 * a.stageX - 240 - this.offsetX, f = this.graphics.command.x;
          0 >= b + f ? d.setSlideCommandX(0, !0) : b + f > d.maxWidth + 10 ? d.setSlideCommandX(d.maxWidth, !0) : (this.offsetX = -(this.x - .75 * a.stageX + 240), d.setSlideCommandX(b));
        }
      });
      this.valueSetter_.on("pressup", function(a) {
        d.isAdjusting = !1;
        delete d.viewValue_;
      });
      this.view_.addChild(this.valueSetter_);
      a = Entry.variableContainer.variables_.length;
      this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (this.setX(-230 + 80 * Math.floor(a / 11)), this.setY(24 * b + 20 - 135 - 264 * Math.floor(a / 11)));
    } else {
      this.view_ = new createjs.Container, this.rect_ = new createjs.Shape, this.view_.addChild(this.rect_), this.view_.variable = this, this.titleView_ = new createjs.Text("asdf", this.FONT, "#000"), this.titleView_.textBaseline = "alphabetic", this.titleView_.textAlign = "center", this.titleView_.width = this.width_ - 2 * this.BORDER, this.titleView_.y = this.BORDER + 10, this.titleView_.x = this.width_ / 2, this.view_.addChild(this.titleView_), this.resizeHandle_ = new createjs.Shape, this.resizeHandle_.graphics.f("#1bafea").ss(1, 
      0, 0).s("#1bafea").lt(0, -9).lt(-9, 0).lt(0, 0), this.view_.addChild(this.resizeHandle_), this.resizeHandle_.list = this, this.resizeHandle_.on("mouseover", function(a) {
        this.cursor = "nwse-resize";
      }), this.resizeHandle_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.offset = {x:.75 * a.stageX - this.list.getWidth(), y:.75 * a.stageY - this.list.getHeight()};
        this.parent.cursor = "nwse-resize";
      }), this.resizeHandle_.on("pressmove", function(a) {
        this.list.setWidth(.75 * a.stageX - this.offset.x);
        this.list.setHeight(.75 * a.stageY - this.offset.y);
        this.list.updateView();
      }), this.view_.on("mouseover", function(a) {
        this.cursor = "move";
      }), this.view_.on("mousedown", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.offset = {x:this.x - (.75 * a.stageX - 240), y:this.y - (.75 * a.stageY - 135)}, this.cursor = "move");
      }), this.view_.on("pressup", function(a) {
        this.cursor = "initial";
        this.variable.isResizing = !1;
      }), this.view_.on("pressmove", function(a) {
        "workspace" != Entry.type || this.variable.isResizing || (this.variable.setX(.75 * a.stageX - 240 + this.offset.x), this.variable.setY(.75 * a.stageY - 135 + this.offset.y), this.variable.updateView());
      }), this.elementView = new createjs.Container, a = new createjs.Text("asdf", this.FONT, "#000"), a.textBaseline = "middle", a.y = 5, this.elementView.addChild(a), this.elementView.indexView = a, a = new createjs.Shape, this.elementView.addChild(a), this.elementView.valueWrapper = a, a = new createjs.Text("fdsa", this.FONT, "#eee"), a.x = 24, a.y = 6, a.textBaseline = "middle", this.elementView.addChild(a), this.elementView.valueView = a, this.elementView.x = this.BORDER, this.scrollButton_ = 
      new createjs.Shape, this.scrollButton_.graphics.f("#aaa").rr(0, 0, 7, 30, 3.5), this.view_.addChild(this.scrollButton_), this.scrollButton_.y = 23, this.scrollButton_.list = this, this.scrollButton_.on("mousedown", function(a) {
        this.list.isResizing = !0;
        this.cursor = "pointer";
        this.offsetY = isNaN(this.offsetY) || 0 > this.offsetY ? a.rawY / 2 : this.offsetY;
      }), this.scrollButton_.on("pressmove", function(a) {
        void 0 === this.moveAmount ? (this.y = a.target.y, this.moveAmount = !0) : this.y = a.rawY / 2 - this.offsetY + this.list.height_ / 100 * 23;
        23 > this.y && (this.y = 23);
        this.y > this.list.getHeight() - 40 && (this.y = this.list.getHeight() - 40);
        this.list.updateView();
      }), this.scrollButton_.on("pressup", function(a) {
        this.moveAmount = void 0;
      }), this.getX() && this.getY() ? (this.setX(this.getX()), this.setY(this.getY())) : (a = Entry.variableContainer.lists_.length, this.setX(110 * -Math.floor(a / 6) + 120), this.setY(24 * b + 20 - 135 - 145 * Math.floor(a / 6)));
    }
  }
  this.setVisible(this.isVisible());
  this.updateView();
  Entry.stage.loadVariable(this);
};
Entry.Variable.prototype.updateView = function() {
  if (this.view_ && this.isVisible()) {
    if ("variable" == this.type) {
      this.view_.x = this.getX();
      this.view_.y = this.getY();
      if (this.object_) {
        var b = Entry.container.getObject(this.object_);
        this.textView_.text = b ? b.name + ":" + this.getName() : this.getName();
      } else {
        this.textView_.text = this.getName();
      }
      this.valueView_.x = this.textView_.getMeasuredWidth() + 14;
      this.valueView_.y = 1;
      this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue();
      this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4);
      this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7);
    } else {
      if ("slide" == this.type) {
        this.view_.x = this.getX(), this.view_.y = this.getY(), this.object_ ? (b = Entry.container.getObject(this.object_), this.textView_.text = b ? b.name + ":" + this.getName() : this.getName()) : this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = this.getValue().toFixed(2).replace(".00", "") : this.valueView_.text = this.getValue(), b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 
        26, b = Math.max(b, 90), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, b, 33, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#1bafea").ss(1, 2, 0).s("#1bafea").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7), b = this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, b = Math.max(b, 90), this.maxWidth = b - 20, this.slideBar_.graphics.clear().beginFill("#A0A1A1").s("#A0A1A1").ss(1).dr(10, 
        10, this.maxWidth, 1.5), b = this.getSlidePosition(this.maxWidth), this.valueSetter_.graphics.clear().beginFill("#1bafea").s("#A0A1A1").ss(1).dc(b, 10.5, 3);
      } else {
        if ("list" == this.type) {
          this.view_.x = this.getX();
          this.view_.y = this.getY();
          this.resizeHandle_.x = this.width_ - 2;
          this.resizeHandle_.y = this.height_ - 2;
          var a = this.getName();
          this.object_ && (b = Entry.container.getObject(this.object_)) && (a = b.name + ":" + a);
          a = 7 < a.length ? a.substr(0, 6) + ".." : a;
          this.titleView_.text = a;
          this.titleView_.x = this.width_ / 2;
          for (this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rect(0, 0, this.width_, this.height_);this.view_.children[4];) {
            this.view_.removeChild(this.view_.children[4]);
          }
          b = Math.floor((this.getHeight() - 20) / 20);
          b < this.array_.length ? (this.scrollButton_.y > this.getHeight() - 40 && (this.scrollButton_.y = this.getHeight() - 40), this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, -2, this.getWidth() - 20 - 10 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !0, this.scrollButton_.x = this.getWidth() - 12, this.scrollPosition = Math.floor((this.scrollButton_.y - 23) / (this.getHeight() - 23 - 40) * (this.array_.length - b))) : (this.elementView.valueWrapper.graphics.clear().f("#1bafea").rr(20, 
          -2, this.getWidth() - 20 - 2 * this.BORDER, 17, 2), this.scrollButton_.visible = !1, this.scrollPosition = 0);
          for (a = this.scrollPosition;a < this.scrollPosition + b && a < this.array_.length;a++) {
            this.elementView.indexView.text = a + 1;
            var d = String(this.array_[a].data), c = Math.floor((this.getWidth() - 50) / 7), d = Entry.cutStringByLength(d, c), d = String(this.array_[a].data).length > d.length ? d + ".." : d;
            this.elementView.valueView.text = d;
            d = this.elementView.clone(!0);
            d.y = 20 * (a - this.scrollPosition) + 23;
            this.view_.addChild(d);
          }
        } else {
          "answer" == this.type ? (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? parseInt(this.getValue(), 10) == this.getValue() ? this.valueView_.text = this.getValue() : this.valueView_.text = this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, 
          -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#E457DC").ss(1, 2, 0).s("#E457DC").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7)) : (this.view_.x = this.getX(), this.view_.y = this.getY(), this.textView_.text = this.getName(), this.valueView_.x = this.textView_.getMeasuredWidth() + 14, this.valueView_.y = 1, this.isNumber() ? this.valueView_.text = 
          this.getValue().toFixed(1).replace(".00", "") : this.valueView_.text = this.getValue(), this.rect_.graphics.clear().f("#ffffff").ss(1, 2, 0).s("#A0A1A1").rc(0, -14, this.textView_.getMeasuredWidth() + this.valueView_.getMeasuredWidth() + 26, 20, 4, 4, 4, 4), this.wrapper_.graphics.clear().f("#ffbb14").ss(1, 2, 0).s("orange").rc(this.textView_.getMeasuredWidth() + 7, -11, this.valueView_.getMeasuredWidth() + 15, 14, 7, 7, 7, 7));
        }
      }
    }
  }
};
Entry.Variable.prototype.getName = function() {
  return this.name_;
};
Entry.Variable.prototype.setName = function(b) {
  Entry.assert("string" == typeof b, "Variable name must be string");
  this.name_ = b;
  this.updateView();
};
Entry.Variable.prototype.getId = function() {
  return this.id_;
};
Entry.Variable.prototype.getValue = function() {
  return this.isNumber() ? Number(this.value_) : this.value_;
};
Entry.Variable.prototype.isNumber = function() {
  return isNaN(this.value_) ? !1 : !0;
};
Entry.Variable.prototype.setValue = function(b) {
  "slide" != this.type ? this.value_ = b : (b = Number(b), this.value_ = b < this.minValue_ ? this.minValue_ : b > this.maxValue_ ? this.maxValue_ : b, this.isFloatPoint() ? delete this.viewValue_ : this.viewValue_ = this.value_);
  this.isCloud_ && Entry.variableContainer.updateCloudVariables();
  this.updateView();
};
Entry.Variable.prototype.isVisible = function() {
  return this.visible_;
};
Entry.Variable.prototype.setVisible = function(b) {
  Entry.assert("boolean" == typeof b, "Variable visible state must be boolean");
  (this.visible_ = this.view_.visible = b) && this.updateView();
};
Entry.Variable.prototype.setX = function(b) {
  this.x_ = b;
  this.updateView();
};
Entry.Variable.prototype.getX = function() {
  return this.x_;
};
Entry.Variable.prototype.setY = function(b) {
  this.y_ = b;
  this.updateView();
};
Entry.Variable.prototype.getY = function() {
  return this.y_;
};
Entry.Variable.prototype.setWidth = function(b) {
  this.width_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getWidth = function() {
  return this.width_;
};
Entry.Variable.prototype.isInList = function(b, a) {
  this.getX();
  this.getY();
};
Entry.Variable.prototype.setHeight = function(b) {
  this.height_ = 100 > b ? 100 : b;
  this.updateView();
};
Entry.Variable.prototype.getHeight = function() {
  return this.height_;
};
Entry.Variable.prototype.takeSnapshot = function() {
  this.snapshot_ = this.toJSON();
};
Entry.Variable.prototype.loadSnapshot = function() {
  this.snapshot_ && !this.isCloud_ && this.syncModel_(this.snapshot_);
};
Entry.Variable.prototype.syncModel_ = function(b) {
  this.setX(b.x);
  this.setY(b.y);
  this.id_ = b.id;
  this.setVisible(b.visible);
  this.setValue(b.value);
  this.setName(b.name);
  this.isCloud_ = b.isCloud;
  "list" == this.type && (this.setWidth(b.width), this.setHeight(b.height), this.array_ = b.array);
};
Entry.Variable.prototype.toJSON = function() {
  var b = {};
  b.name = this.name_;
  b.id = this.id_;
  b.visible = this.visible_;
  b.value = this.value_;
  b.variableType = this.type;
  "list" == this.type ? (b.width = this.getWidth(), b.height = this.getHeight(), b.array = JSON.parse(JSON.stringify(this.array_))) : "slide" == this.type && (b.minValue = this.minValue_, b.maxValue = this.maxValue_);
  b.isCloud = this.isCloud_;
  b.object = this.object_;
  b.x = this.x_;
  b.y = this.y_;
  return b;
};
Entry.Variable.prototype.remove = function() {
  Entry.stage.removeVariable(this);
};
Entry.Variable.prototype.clone = function() {
  var b = this.toJSON();
  b.isClone = !0;
  return b = new Entry.Variable(b);
};
Entry.Variable.prototype.getType = function() {
  return this.type;
};
Entry.Variable.prototype.setType = function(b) {
  this.type = b;
};
Entry.Variable.prototype.getSlidePosition = function(b) {
  var a = this.minValue_;
  return Math.abs((this.viewValue_ || this.value_) - a) / Math.abs(this.maxValue_ - a) * b + 10;
};
Entry.Variable.prototype.setSlideCommandX = function(b, a) {
  var d = this.valueSetter_.graphics.command;
  b = "undefined" == typeof b ? 10 : b;
  d.x = a ? b + 10 : d.x + b;
  this.updateSlideValueByView();
};
Entry.Variable.prototype.updateSlideValueByView = function() {
  var b = Math.max(this.valueSetter_.graphics.command.x - 10, 0) / this.maxWidth;
  0 > b && (b = 0);
  1 < b && (b = 1);
  var a = parseFloat(this.minValue_), d = parseFloat(this.maxValue_), b = (a + Number(Math.abs(d - a) * b)).toFixed(2), b = parseFloat(b);
  b < a ? b = this.minValue_ : b > d && (b = this.maxValue_);
  this.isFloatPoint() || (this.viewValue_ = b, b = Math.round(b));
  this.setValue(b);
};
Entry.Variable.prototype.getMinValue = function() {
  return this.minValue_;
};
Entry.Variable.prototype.setMinValue = function(b) {
  this.minValue_ = b;
  this.value_ < b && (this.value_ = b);
  this.updateView();
  this.isMinFloat = Entry.isFloat(this.minValue_);
};
Entry.Variable.prototype.getMaxValue = function() {
  return this.maxValue_;
};
Entry.Variable.prototype.setMaxValue = function(b) {
  this.maxValue_ = b;
  this.value_ > b && (this.value_ = b);
  this.updateView();
  this.isMaxFloat = Entry.isFloat(this.maxValue_);
};
Entry.Variable.prototype.isFloatPoint = function() {
  return this.isMaxFloat || this.isMinFloat;
};
Entry.VariableContainer = function() {
  this.variables_ = [];
  this.messages_ = [];
  this.lists_ = [];
  this.functions_ = {};
  this.viewMode_ = "all";
  this.selected = null;
  this.variableAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.listAddPanel = {isOpen:!1, info:{object:null, isCloud:!1}};
  this.selectedVariable = null;
  this._variableRefs = [];
  this._messageRefs = [];
  this._functionRefs = [];
};
Entry.VariableContainer.prototype.createDom = function(b) {
  var a = this;
  this.view_ = b;
  var d = Entry.createElement("table");
  d.addClass("entryVariableSelectorWorkspace");
  this.view_.appendChild(d);
  var c = Entry.createElement("tr");
  d.appendChild(c);
  var e = this.createSelectButton("all");
  e.setAttribute("rowspan", "2");
  e.addClass("selected", "allButton");
  c.appendChild(e);
  c.appendChild(this.createSelectButton("variable", Entry.variableEnable));
  c.appendChild(this.createSelectButton("message", Entry.messageEnable));
  c = Entry.createElement("tr");
  c.appendChild(this.createSelectButton("list", Entry.listEnable));
  c.appendChild(this.createSelectButton("func", Entry.functionEnable));
  d.appendChild(c);
  d = Entry.createElement("ul");
  d.addClass("entryVariableListWorkspace");
  this.view_.appendChild(d);
  this.listView_ = d;
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.variable_create;
  var f = this;
  this.variableAddButton_ = d;
  d.bindOnClick(function(b) {
    b = f.variableAddPanel;
    var d = b.view.name.value.trim();
    b.isOpen ? d && 0 !== d.length ? a.addVariable() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  this.generateVariableAddView();
  this.generateListAddView();
  this.generateVariableSplitterView();
  this.generateVariableSettingView();
  this.generateListSettingView();
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.message_create;
  this.messageAddButton_ = d;
  d.bindOnClick(function(b) {
    a.addMessage({name:Lang.Workspace.message + " " + (a.messages_.length + 1)});
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.list_create;
  this.listAddButton_ = d;
  d.bindOnClick(function(b) {
    b = f.listAddPanel;
    var d = b.view.name.value.trim();
    b.isOpen ? d && 0 !== d.length ? a.addList() : (b.view.addClass("entryRemove"), b.isOpen = !1) : (b.view.removeClass("entryRemove"), b.view.name.focus(), b.isOpen = !0);
  });
  d = Entry.createElement("li");
  d.addClass("entryVariableAddWorkspace");
  d.addClass("entryVariableListElementWorkspace");
  d.innerHTML = "+ " + Lang.Workspace.function_create;
  this.functionAddButton_ = d;
  d.bindOnClick(function(b) {
    b = a._getBlockMenu();
    Entry.playground.changeViewMode("code");
    "func" != b.lastSelector && b.selectMenu("func");
    a.createFunction();
  });
  return b;
};
Entry.VariableContainer.prototype.createSelectButton = function(b, a) {
  var d = this;
  void 0 === a && (a = !0);
  var c = Entry.createElement("td");
  c.addClass("entryVariableSelectButtonWorkspace", b);
  c.innerHTML = Lang.Workspace[b];
  a ? c.bindOnClick(function(a) {
    d.selectFilter(b);
    this.addClass("selected");
  }) : c.addClass("disable");
  return c;
};
Entry.VariableContainer.prototype.selectFilter = function(b) {
  for (var a = this.view_.getElementsByTagName("td"), d = 0;d < a.length;d++) {
    a[d].removeClass("selected"), a[d].hasClass(b) && a[d].addClass("selected");
  }
  this.viewMode_ = b;
  this.select();
  this.updateList();
};
Entry.VariableContainer.prototype.updateVariableAddView = function(b) {
  b = "variable" == (b ? b : "variable") ? this.variableAddPanel : this.listAddPanel;
  var a = b.info, d = b.view;
  b.view.addClass("entryRemove");
  d.cloudCheck.removeClass("entryVariableAddChecked");
  d.localCheck.removeClass("entryVariableAddChecked");
  d.globalCheck.removeClass("entryVariableAddChecked");
  d.cloudWrapper.removeClass("entryVariableAddSpaceUnCheckedWorkspace");
  a.isCloud && d.cloudCheck.addClass("entryVariableAddChecked");
  b.isOpen && (d.removeClass("entryRemove"), d.name.focus());
  a.object ? (d.localCheck.addClass("entryVariableAddChecked"), d.cloudWrapper.addClass("entryVariableAddSpaceUnCheckedWorkspace")) : d.globalCheck.addClass("entryVariableAddChecked");
};
Entry.VariableContainer.prototype.select = function(b) {
  b = this.selected == b ? null : b;
  this.selected && (this.selected.listElement.removeClass("selected"), this.selected.callerListElement && (this.listView_.removeChild(this.selected.callerListElement), delete this.selected.callerListElement), this.selected = null);
  b && (b.listElement.addClass("selected"), this.selected = b, b instanceof Entry.Variable ? (this.renderVariableReference(b), b.object_ && Entry.container.selectObject(b.object_, !0)) : b instanceof Entry.Func ? this.renderFunctionReference(b) : this.renderMessageReference(b));
};
Entry.VariableContainer.prototype.renderMessageReference = function(b) {
  for (var a = this, d = this._messageRefs, c = b.id, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["START_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.message = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(this.message));
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.renderVariableReference = function(b) {
  for (var a = this, d = this._variableRefs, c = b.id_, e = [], f = 0;f < d.length;f++) {
    -1 < d[f].block.params.indexOf(c) && e.push(d[f]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (f in e) {
    var c = e[f], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(c.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = c.object.name + " : " + Lang.Blocks["VARIABLE_" + c.block.type];
    g.appendChild(h);
    g.caller = c;
    g.variable = b;
    g.bindOnClick(function(b) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null));
      b = this.caller;
      b = b.funcBlock || b.block;
      b.view.getBoard().activateBlock(b);
      Entry.playground.toggleOnVariableView();
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === e.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.renderFunctionReference = function(b) {
  for (var a = this, d = this._functionRefs, c = [], e = 0;e < d.length;e++) {
    c.push(d[e]);
  }
  d = Entry.createElement("ul");
  d.addClass("entryVariableListCallerListWorkspace");
  for (e in c) {
    var f = c[e], g = Entry.createElement("li");
    g.addClass("entryVariableListCallerWorkspace");
    g.appendChild(f.object.thumbnailView_.cloneNode());
    var h = Entry.createElement("div");
    h.addClass("entryVariableListCallerNameWorkspace");
    h.innerHTML = f.object.name;
    g.appendChild(h);
    g.caller = f;
    g.bindOnClick(function(d) {
      Entry.playground.object != this.caller.object && (Entry.container.selectObject(), Entry.container.selectObject(this.caller.object.id, !0), a.select(null), a.select(b));
      d = this.caller.block;
      Entry.playground.toggleOnVariableView();
      d.view.getBoard().activateBlock(d);
      Entry.playground.changeViewMode("variable");
    });
    d.appendChild(g);
  }
  0 === c.length && (g = Entry.createElement("li"), g.addClass("entryVariableListCallerWorkspace"), g.addClass("entryVariableListCallerNoneWorkspace"), g.innerHTML = Lang.Workspace.no_use, d.appendChild(g));
  b.callerListElement = d;
  this.listView_.insertBefore(d, b.listElement);
  this.listView_.insertBefore(b.listElement, d);
};
Entry.VariableContainer.prototype.updateList = function() {
  if (this.listView_) {
    this.variableSettingView.addClass("entryRemove");
    for (this.listSettingView.addClass("entryRemove");this.listView_.firstChild;) {
      this.listView_.removeChild(this.listView_.firstChild);
    }
    var b = this.viewMode_, a = [];
    if ("all" == b || "message" == b) {
      "message" == b && this.listView_.appendChild(this.messageAddButton_);
      for (var d in this.messages_) {
        var c = this.messages_[d];
        a.push(c);
        var e = c.listElement;
        this.listView_.appendChild(e);
        c.callerListElement && this.listView_.appendChild(c.callerListElement);
      }
    }
    if ("all" == b || "variable" == b) {
      if ("variable" == b) {
        e = this.variableAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.variableAddButton_);
        this.listView_.appendChild(this.variableAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.Variable_used_at_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ || (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.Variable_used_at_special_object;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.variables_) {
          c = this.variables_[d], c.object_ && (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.variables_) {
          c = this.variables_[d], a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == b || "list" == b) {
      if ("list" == b) {
        e = this.listAddPanel.info;
        e.object && !Entry.playground.object && (e.object = null);
        this.listView_.appendChild(this.listAddButton_);
        this.listView_.appendChild(this.listAddPanel.view);
        this.variableSplitters.top.innerHTML = Lang.Workspace.List_used_all_objects;
        this.listView_.appendChild(this.variableSplitters.top);
        this.updateVariableAddView("list");
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ || (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.variableSplitters.bottom.innerHTML = Lang.Workspace.list_used_specific_objects;
        this.listView_.appendChild(this.variableSplitters.bottom);
        for (d in this.lists_) {
          c = this.lists_[d], c.object_ && (a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement));
        }
        this.updateVariableAddView("variable");
      } else {
        for (d in this.lists_) {
          c = this.lists_[d], a.push(c), e = c.listElement, this.listView_.appendChild(e), c.callerListElement && this.listView_.appendChild(c.callerListElement);
        }
      }
    }
    if ("all" == b || "func" == b) {
      for (d in "func" == b && this.listView_.appendChild(this.functionAddButton_), this.functions_) {
        b = this.functions_[d], a.push(b), e = b.listElement, this.listView_.appendChild(e), b.callerListElement && this.listView_.appendChild(b.callerListElement);
      }
    }
    this.listView_.appendChild(this.variableSettingView);
    this.listView_.appendChild(this.listSettingView);
  }
};
Entry.VariableContainer.prototype.setMessages = function(b) {
  for (var a in b) {
    var d = b[a];
    d.id || (d.id = Entry.generateHash());
    this.createMessageView(d);
    this.messages_.push(d);
  }
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setVariables = function(b) {
  for (var a in b) {
    var d = new Entry.Variable(b[a]), c = d.getType();
    "variable" == c || "slide" == c ? (d.generateView(this.variables_.length), this.createVariableView(d), this.variables_.push(d)) : "list" == c ? (d.generateView(this.lists_.length), this.createListView(d), this.lists_.push(d)) : "timer" == c ? this.generateTimer(d) : "answer" == c && this.generateAnswer(d);
  }
  Entry.isEmpty(Entry.engine.projectTimer) && Entry.variableContainer.generateTimer();
  Entry.isEmpty(Entry.container.inputValue) && Entry.variableContainer.generateAnswer();
  Entry.playground.reloadPlayground();
  this.updateList();
};
Entry.VariableContainer.prototype.setFunctions = function(b) {
  for (var a in b) {
    var d = new Entry.Func(b[a]);
    d.generateBlock();
    this.createFunctionView(d);
    this.functions_[d.id] = d;
  }
  this.updateList();
};
Entry.VariableContainer.prototype.getFunction = function(b) {
  return this.functions_[b];
};
Entry.VariableContainer.prototype.getVariable = function(b, a) {
  var d = Entry.findObjsByKey(this.variables_, "id_", b)[0];
  a && a.isClone && d.object_ && (d = Entry.findObjsByKey(a.variables, "id_", b)[0]);
  return d;
};
Entry.VariableContainer.prototype.getList = function(b, a) {
  var d = Entry.findObjsByKey(this.lists_, "id_", b)[0];
  a && a.isClone && d.object_ && (d = Entry.findObjsByKey(a.lists, "id_", b)[0]);
  return d;
};
Entry.VariableContainer.prototype.createFunction = function() {
  if (!Entry.Func.isEdit) {
    var b = new Entry.Func;
    Entry.Func.edit(b);
  }
};
Entry.VariableContainer.prototype.addFunction = function(b) {
};
Entry.VariableContainer.prototype.removeFunction = function(b) {
  delete this.functions_[b.id];
  this.updateList();
};
Entry.VariableContainer.prototype.checkListPosition = function(b, a) {
  var d = b.x_ + b.width_, c = -b.y_, e = -b.y_ + -b.height_;
  return a.x > b.x_ && a.x < d && a.y < c && a.y > e ? !0 : !1;
};
Entry.VariableContainer.prototype.getListById = function(b) {
  var a = this.lists_, d = [];
  if (0 < a.length) {
    for (var c = 0;c < a.length;c++) {
      this.checkListPosition(a[c], b) && d.push(a[c]);
    }
    return d;
  }
  return !1;
};
Entry.VariableContainer.prototype.editFunction = function(b, a) {
};
Entry.VariableContainer.prototype.saveFunction = function(b) {
  this.functions_[b.id] || (this.functions_[b.id] = b, this.createFunctionView(b));
  b.listElement.nameField.innerHTML = b.description;
  this.updateList();
};
Entry.VariableContainer.prototype.createFunctionView = function(b) {
  var a = this;
  if (this.view_) {
    var d = Entry.createElement("li");
    d.addClass("entryVariableListElementWorkspace");
    d.addClass("entryFunctionElementWorkspace");
    d.bindOnClick(function(d) {
      d.stopPropagation();
      a.select(b);
    });
    var c = Entry.createElement("button");
    c.addClass("entryVariableListElementDeleteWorkspace");
    c.bindOnClick(function(d) {
      d.stopPropagation();
      a.removeFunction(b);
      a.selected = null;
    });
    var e = Entry.createElement("button");
    e.addClass("entryVariableListElementEditWorkspace");
    var f = this._getBlockMenu();
    e.bindOnClick(function(a) {
      a.stopPropagation();
      Entry.Func.edit(b);
      Entry.playground && (Entry.playground.changeViewMode("code"), "func" != f.lastSelector && f.selectMenu("func"));
    });
    var g = Entry.createElement("div");
    g.addClass("entryVariableFunctionElementNameWorkspace");
    g.innerHTML = b.description;
    d.nameField = g;
    d.appendChild(g);
    d.appendChild(e);
    d.appendChild(c);
    b.listElement = d;
  }
};
Entry.VariableContainer.prototype.checkAllVariableName = function(b, a) {
  a = this[a];
  for (var d = 0;d < a.length;d++) {
    if (a[d].name_ == b) {
      return !0;
    }
  }
  return !1;
};
Entry.VariableContainer.prototype.addVariable = function(b) {
  if (!b) {
    var a = this.variableAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.variable);
    b = this.checkAllVariableName(b, "variables_") ? Entry.getOrderedName(b, this.variables_, "name_") : b;
    var d = a.info;
    b = {name:b, isCloud:d.isCloud, object:d.object, variableType:"variable"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("variable");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add variable", this, this.removeVariable, b);
  b.generateView(this.variables_.length);
  this.createVariableView(b);
  this.variables_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeVariable, b);
};
Entry.VariableContainer.prototype.removeVariable = function(b) {
  var a = this.variables_.indexOf(b), d = b.toJSON();
  this.selected == b && this.select(null);
  b.remove();
  this.variables_.splice(a, 1);
  Entry.stateManager && Entry.stateManager.addCommand("remove variable", this, this.addVariable, d);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addVariable, d);
};
Entry.VariableContainer.prototype.changeVariableName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.variables_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.variable_rename_failed, Lang.Workspace.variable_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.variable_rename, Lang.Workspace.variable_rename_ok)));
};
Entry.VariableContainer.prototype.changeListName = function(b, a) {
  b.name_ != a && (Entry.isExist(a, "name_", this.lists_) ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name_, Entry.toast.alert(Lang.Workspace.list_rename_failed, Lang.Workspace.list_too_long)) : (b.name_ = a, b.updateView(), Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.list_rename, Lang.Workspace.list_rename_ok)));
};
Entry.VariableContainer.prototype.removeList = function(b) {
  var a = this.lists_.indexOf(b), d = b.toJSON();
  Entry.stateManager && Entry.stateManager.addCommand("remove list", this, this.addList, d);
  this.selected == b && this.select(null);
  b.remove();
  this.lists_.splice(a, 1);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.addList, d);
};
Entry.VariableContainer.prototype.createVariableView = function(b) {
  var a = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  b.object_ ? d.addClass("entryVariableLocalElementWorkspace") : b.isCloud_ ? d.addClass("entryVariableCloudElementWorkspace") : d.addClass("entryVariableGlobalElementWorkspace");
  d.bindOnClick(function(d) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(d) {
    d.stopPropagation();
    a.removeVariable(b);
    a.selectedVariable = null;
    a.variableSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(d) {
    d.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(b) {
    b.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(null, "variable");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.addClass("entryVariableListElementNameWorkspace");
  h.setAttribute("disabled", "disabled");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? a.changeVariableName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Workspace.variable_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  b.listElement = d;
};
Entry.VariableContainer.prototype.addMessage = function(b) {
  b.id || (b.id = Entry.generateHash());
  Entry.stateManager && Entry.stateManager.addCommand("add message", this, this.removeMessage, b);
  this.createMessageView(b);
  this.messages_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removeMessage, b);
};
Entry.VariableContainer.prototype.removeMessage = function(b) {
  this.selected == b && this.select(null);
  Entry.stateManager && Entry.stateManager.addCommand("remove message", this, this.addMessage, b);
  var a = this.messages_.indexOf(b);
  this.messages_.splice(a, 1);
  this.updateList();
  Entry.playground.reloadPlayground();
  return new Entry.State(this, this.addMessage, b);
};
Entry.VariableContainer.prototype.changeMessageName = function(b, a) {
  b.name != a && (Entry.isExist(a, "name", this.messages_) ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_dup)) : 10 < a.length ? (b.listElement.nameField.value = b.name, Entry.toast.alert(Lang.Workspace.message_rename_failed, Lang.Workspace.message_too_long)) : (b.name = a, Entry.playground.reloadPlayground(), Entry.toast.success(Lang.Workspace.message_rename, Lang.Workspace.message_rename_ok)));
};
Entry.VariableContainer.prototype.createMessageView = function(b) {
  var a = this, d = Entry.createElement("li");
  d.addClass("entryVariableListElementWorkspace");
  d.addClass("entryMessageElementWorkspace");
  d.bindOnClick(function(d) {
    a.select(b);
  });
  var c = Entry.createElement("button");
  c.addClass("entryVariableListElementDeleteWorkspace");
  c.bindOnClick(function(d) {
    d.stopPropagation();
    a.removeMessage(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementEditWorkspace");
  e.bindOnClick(function(a) {
    a.stopPropagation();
    g.removeAttribute("disabled");
    g.focus();
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.addClass("entryRemove");
  f.bindOnClick(function(a) {
    a.stopPropagation();
    g.blur();
    e.removeClass("entryRemove");
    this.addClass("entryRemove");
  });
  var g = Entry.createElement("input");
  g.addClass("entryVariableListElementNameWorkspace");
  g.value = b.name;
  g.bindOnClick(function(a) {
    a.stopPropagation();
  });
  g.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? (a.changeMessageName(b, this.value), e.removeClass("entryRemove"), f.addClass("entryRemove"), g.setAttribute("disabled", "disabled")) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.sign_can_not_space), this.value = b.name);
  };
  g.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = g;
  d.appendChild(g);
  d.appendChild(e);
  d.appendChild(f);
  d.appendChild(c);
  b.listElement = d;
};
Entry.VariableContainer.prototype.addList = function(b) {
  if (!b) {
    var a = this.listAddPanel;
    b = a.view.name.value.trim();
    b && 0 !== b.length || (b = Lang.Workspace.list);
    var d = a.info;
    b = this.checkAllVariableName(b, "lists_") ? Entry.getOrderedName(b, this.lists_, "name_") : b;
    b = {name:b, isCloud:d.isCloud, object:d.object, variableType:"list"};
    a.view.addClass("entryRemove");
    this.resetVariableAddPanel("list");
  }
  b = new Entry.Variable(b);
  Entry.stateManager && Entry.stateManager.addCommand("add list", this, this.removeList, b);
  b.generateView(this.lists_.length);
  this.createListView(b);
  this.lists_.unshift(b);
  Entry.playground.reloadPlayground();
  this.updateList();
  return new Entry.State(this, this.removelist, b);
};
Entry.VariableContainer.prototype.createListView = function(b) {
  var a = this, d = Entry.createElement("li"), c = Entry.createElement("div");
  c.addClass("entryVariableListElementWrapperWorkspace");
  d.appendChild(c);
  d.addClass("entryVariableListElementWorkspace");
  b.object_ ? d.addClass("entryListLocalElementWorkspace") : b.isCloud_ ? d.addClass("entryListCloudElementWorkspace") : d.addClass("entryListGlobalElementWorkspace");
  d.bindOnClick(function(d) {
    a.select(b);
  });
  var e = Entry.createElement("button");
  e.addClass("entryVariableListElementDeleteWorkspace");
  e.bindOnClick(function(d) {
    d.stopPropagation();
    a.removeList(b);
    a.selectedList = null;
    a.listSettingView.addClass("entryRemove");
  });
  var f = Entry.createElement("button");
  f.addClass("entryVariableListElementEditWorkspace");
  f.bindOnClick(function(d) {
    d.stopPropagation();
    h.removeAttribute("disabled");
    g.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.updateSelectedVariable(b);
    h.focus();
  });
  d.editButton = f;
  var g = Entry.createElement("button");
  g.addClass("entryVariableListElementEditWorkspace");
  g.addClass("entryRemove");
  g.bindOnClick(function(d) {
    d.stopPropagation();
    h.blur();
    h.setAttribute("disabled", "disabled");
    f.removeClass("entryRemove");
    this.addClass("entryRemove");
    a.select(b);
    a.updateSelectedVariable(null, "list");
  });
  d.editSaveButton = g;
  var h = Entry.createElement("input");
  h.setAttribute("disabled", "disabled");
  h.addClass("entryVariableListElementNameWorkspace");
  h.value = b.name_;
  h.bindOnClick(function(a) {
    a.stopPropagation();
  });
  h.onblur = function(d) {
    (d = this.value.trim()) && 0 !== d.length ? a.changeListName(b, this.value) : (Entry.toast.alert(Lang.Msgs.warn, Lang.Msgs.list_can_not_space), this.value = b.getName());
  };
  h.onkeydown = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.nameField = h;
  c.appendChild(h);
  c.appendChild(f);
  c.appendChild(g);
  c.appendChild(e);
  b.listElement = d;
};
Entry.VariableContainer.prototype.mapVariable = function(b, a) {
  for (var d = this.variables_.length, c = 0;c < d;c++) {
    b(this.variables_[c], a);
  }
};
Entry.VariableContainer.prototype.mapList = function(b, a) {
  for (var d = this.lists_.length, c = 0;c < d;c++) {
    b(this.lists_[c], a);
  }
};
Entry.VariableContainer.prototype.getVariableJSON = function() {
  for (var b = [], a = 0;a < this.variables_.length;a++) {
    b.push(this.variables_[a].toJSON());
  }
  for (a = 0;a < this.lists_.length;a++) {
    b.push(this.lists_[a].toJSON());
  }
  Entry.engine.projectTimer && b.push(Entry.engine.projectTimer);
  a = Entry.container.inputValue;
  Entry.isEmpty(a) || b.push(a);
  return b;
};
Entry.VariableContainer.prototype.getMessageJSON = function() {
  for (var b = [], a = 0;a < this.messages_.length;a++) {
    b.push({id:this.messages_[a].id, name:this.messages_[a].name});
  }
  return b;
};
Entry.VariableContainer.prototype.getFunctionJSON = function() {
  var b = [], a;
  for (a in this.functions_) {
    var d = this.functions_[a], d = {id:d.id, content:JSON.stringify(d.content.toJSON())};
    b.push(d);
  }
  return b;
};
Entry.VariableContainer.prototype.resetVariableAddPanel = function(b) {
  b = b || "variable";
  var a = "variable" == b ? this.variableAddPanel : this.listAddPanel, d = a.info;
  d.isCloud = !1;
  d.object = null;
  a.view.name.value = "";
  a.isOpen = !1;
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.generateVariableAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.variableAddPanel.view = a;
  this.variableAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  a.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.Variable_placeholder_name);
  c.variableContainer = this;
  c.onkeypress = function(a) {
    13 == a.keyCode && (Entry.variableContainer.addVariable(), b.updateSelectedVariable(b.variables_[0]), a = b.variables_[0].listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  this.variableAddPanel.view.name = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(a) {
    b.variableAddPanel.info.object = null;
    b.updateVariableAddView("variable");
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.globalCheck = c;
  this.variableAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(a) {
    Entry.playground.object && (a = b.variableAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("variable"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.variableAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  a.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.variableAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("variable"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.Variable_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.variableAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.variableAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(d);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.variableAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("variable");
  });
  d.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    Entry.variableContainer.addVariable();
    b.updateSelectedVariable(b.variables_[0]);
    a = b.variables_[0].listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  d.appendChild(a);
};
Entry.VariableContainer.prototype.generateListAddView = function() {
  var b = this, a = Entry.createElement("li");
  this.listAddPanel.view = a;
  this.listAddPanel.isOpen = !1;
  a.addClass("entryVariableAddSpaceWorkspace");
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceNameWrapperWorkspace");
  d.addClass("entryListAddSpaceNameWrapperWorkspace");
  a.appendChild(d);
  var c = Entry.createElement("input");
  c.addClass("entryVariableAddSpaceInputWorkspace");
  c.setAttribute("placeholder", Lang.Workspace.list_name);
  this.listAddPanel.view.name = c;
  c.variableContainer = this;
  c.onkeypress = function(a) {
    13 == a.keyCode && (b.addList(), a = b.lists_[0], b.updateSelectedVariable(a), a = a.listElement, a.editButton.addClass("entryRemove"), a.editSaveButton.removeClass("entryRemove"), a.nameField.removeAttribute("disabled"));
  };
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceGlobalWrapperWorkspace");
  d.bindOnClick(function(a) {
    b.listAddPanel.info.object = null;
    b.updateVariableAddView("list");
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.use_all_objects;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.globalCheck = c;
  this.listAddPanel.info.object || c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceLocalWrapperWorkspace");
  d.bindOnClick(function(a) {
    Entry.playground.object && (a = b.listAddPanel.info, a.object = Entry.playground.object.id, a.isCloud = !1, b.updateVariableAddView("list"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.Variable_use_this_object;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  this.listAddPanel.view.localCheck = c;
  this.variableAddPanel.info.object && addVariableLocalCheck.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  a.cloudWrapper = d;
  d.addClass("entryVariableAddSpaceCloudWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.listAddPanel.info;
    a.object || (a.isCloud = !a.isCloud, b.updateVariableAddView("list"));
  });
  a.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryVariableAddSpaceCloudSpanWorkspace");
  c.innerHTML = Lang.Workspace.List_create_cloud;
  d.appendChild(c);
  c = Entry.createElement("span");
  this.listAddPanel.view.cloudCheck = c;
  c.addClass("entryVariableAddSpaceCheckWorkspace");
  c.addClass("entryVariableAddSpaceCloudCheckWorkspace");
  this.listAddPanel.info.isCloud && c.addClass("entryVariableAddChecked");
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableAddSpaceButtonWrapperWorkspace");
  a.appendChild(d);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceCancelWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.cancel;
  a.bindOnClick(function(a) {
    b.listAddPanel.view.addClass("entryRemove");
    b.resetVariableAddPanel("list");
  });
  d.appendChild(a);
  a = Entry.createElement("span");
  a.addClass("entryVariableAddSpaceConfirmWorkspace");
  a.addClass("entryVariableAddSpaceButtonWorkspace");
  a.innerHTML = Lang.Buttons.save;
  a.variableContainer = this;
  a.bindOnClick(function(a) {
    b.addList();
    a = b.lists_[0];
    b.updateSelectedVariable(a);
    a = a.listElement;
    a.editButton.addClass("entryRemove");
    a.editSaveButton.removeClass("entryRemove");
    a.nameField.removeAttribute("disabled");
  });
  d.appendChild(a);
};
Entry.VariableContainer.prototype.generateVariableSplitterView = function() {
  var b = Entry.createElement("li");
  b.addClass("entryVariableSplitterWorkspace");
  var a = Entry.createElement("li");
  a.addClass("entryVariableSplitterWorkspace");
  this.variableSplitters = {top:b, bottom:a};
};
Entry.VariableContainer.prototype.openVariableAddPanel = function(b) {
  b = b ? b : "variable";
  Entry.playground.toggleOnVariableView();
  Entry.playground.changeViewMode("variable");
  "variable" == b ? this.variableAddPanel.isOpen = !0 : this.listAddPanel.isOpen = !0;
  this.selectFilter(b);
  this.updateVariableAddView(b);
};
Entry.VariableContainer.prototype.getMenuXml = function(b) {
  for (var a = [], d = 0 !== this.variables_.length, c = 0 !== this.lists_.length, e, f = 0, g;g = b[f];f++) {
    var h = g.tagName;
    h && "BLOCK" == h.toUpperCase() ? (e = g.getAttribute("bCategory"), !d && "variable" == e || !c && "list" == e || a.push(g)) : !h || "SPLITTER" != h.toUpperCase() && "BTN" != h.toUpperCase() || !d && "variable" == e || (c || "list" != e) && a.push(g);
  }
  return a;
};
Entry.VariableContainer.prototype.addCloneLocalVariables = function(b) {
  var a = [], d = this;
  this.mapVariable(function(b, d) {
    if (b.object_ && b.object_ == d.objectId) {
      var f = b.toJSON();
      f.originId = f.id;
      f.id = Entry.generateHash();
      f.object = d.newObjectId;
      delete f.x;
      delete f.y;
      a.push(f);
      d.json.script = d.json.script.replace(new RegExp(f.originId, "g"), f.id);
    }
  }, b);
  a.map(function(a) {
    d.addVariable(a);
  });
};
Entry.VariableContainer.prototype.generateTimer = function(b) {
  b || (b = {}, b.id = Entry.generateHash(), b.name = Lang.Workspace.Variable_Timer, b.value = 0, b.variableType = "timer", b.visible = !1, b.x = 150, b.y = -70, b = new Entry.Variable(b));
  b.generateView();
  b.tick = null;
  Entry.engine.projectTimer = b;
  Entry.addEventListener("stop", function() {
    Entry.engine.stopProjectTimer();
  });
};
Entry.VariableContainer.prototype.generateAnswer = function(b) {
  b || (b = new Entry.Variable({id:Entry.generateHash(), name:Lang.Blocks.VARIABLE_get_canvas_input_value, value:0, variableType:"answer", visible:!1, x:150, y:-100}));
  b.generateView();
  Entry.container.inputValue = b;
};
Entry.VariableContainer.prototype.generateVariableSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.variableSettingView = a;
  a.addClass("entryVariableSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryVariableSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.selectedVariable;
    var d = b.variableSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? d.addClass("entryVariableSettingChecked") : d.removeClass("entryVariableSettingChecked");
  });
  a.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_variable;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  a.visibleCheck = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingInitValueWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.default_value;
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryVariableSettingInitValueInputWorkspace");
  a.initValueInput = c;
  c.value = 0;
  c.onkeyup = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  c.onblur = function(a) {
    b.selectedVariable.setValue(this.value);
  };
  a.initValueInput = c;
  d.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSplitterWorkspace");
  a.appendChild(d);
  d = Entry.createElement("div");
  d.addClass("entryVariableSettingSlideWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.slide;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryVariableSettingCheckWorkspace");
  a.slideCheck = c;
  d.appendChild(c);
  d.bindOnClick(function(a) {
    var d;
    a = b.selectedVariable;
    var c = b.variables_, f = a.getType();
    "variable" == f ? (d = a.toJSON(), d.variableType = "slide", d = new Entry.Variable(d), c.splice(c.indexOf(a), 0, d), 0 > d.getValue() && d.setValue(0), 100 < d.getValue() && d.setValue(100), e.removeAttribute("disabled"), g.removeAttribute("disabled")) : "slide" == f && (d = a.toJSON(), d.variableType = "variable", d = new Entry.Variable(d), c.splice(c.indexOf(a), 0, d), e.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
    b.createVariableView(d);
    b.removeVariable(a);
    b.updateSelectedVariable(d);
    d.generateView();
  });
  d = Entry.createElement("div");
  a.minMaxWrapper = d;
  d.addClass("entryVariableSettingMinMaxWrapperWorkspace");
  a.appendChild(d);
  c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.min_value;
  d.appendChild(c);
  var e = Entry.createElement("input");
  e.addClass("entryVariableSettingMinValueInputWorkspace");
  c = b.selectedVariable;
  e.value = c && "slide" == c.type ? c.minValue_ : 0;
  e.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMinValue(this.value), b.updateVariableSettingView(a));
  };
  a.minValueInput = e;
  d.appendChild(e);
  var f = Entry.createElement("span");
  f.addClass("entryVariableSettingMaxValueSpanWorkspace");
  f.innerHTML = Lang.Workspace.max_value;
  d.appendChild(f);
  var g = Entry.createElement("input");
  g.addClass("entryVariableSettingMaxValueInputWorkspace");
  g.value = c && "slide" == c.type ? c.maxValue_ : 100;
  g.onblur = function(a) {
    isNaN(this.value) || (a = b.selectedVariable, a.setMaxValue(this.value), b.updateVariableSettingView(a));
  };
  a.maxValueInput = g;
  d.appendChild(g);
};
Entry.VariableContainer.prototype.updateVariableSettingView = function(b) {
  var a = this.variableSettingView, d = a.visibleCheck, c = a.initValueInput, e = a.slideCheck, f = a.minValueInput, g = a.maxValueInput, h = a.minMaxWrapper;
  d.removeClass("entryVariableSettingChecked");
  b.isVisible() && d.addClass("entryVariableSettingChecked");
  e.removeClass("entryVariableSettingChecked");
  "slide" == b.getType() ? (e.addClass("entryVariableSettingChecked"), f.removeAttribute("disabled"), g.removeAttribute("disabled"), f.value = b.getMinValue(), g.value = b.getMaxValue(), h.removeClass("entryVariableMinMaxDisabledWorkspace")) : (h.addClass("entryVariableMinMaxDisabledWorkspace"), f.setAttribute("disabled", "disabled"), g.setAttribute("disabled", "disabled"));
  c.value = b.getValue();
  b.listElement.appendChild(a);
  a.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.generateListSettingView = function() {
  var b = this, a = Entry.createElement("div");
  a.bindOnClick(function(a) {
    a.stopPropagation();
  });
  this.listSettingView = a;
  a.addClass("entryListSettingWorkspace");
  this.listView_.appendChild(a);
  a.addClass("entryRemove");
  var d = Entry.createElement("div");
  d.addClass("entryListSettingVisibleWrapperWorkspace");
  d.bindOnClick(function(a) {
    a = b.selectedList;
    var d = b.listSettingView.visibleCheck;
    a.setVisible(!a.isVisible());
    a.isVisible() ? d.addClass("entryListSettingCheckedWorkspace") : d.removeClass("entryListSettingCheckedWorkspace");
  });
  a.appendChild(d);
  var c = Entry.createElement("span");
  c.innerHTML = Lang.Workspace.show_list_workspace;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingCheckWorkspace");
  a.visibleCheck = c;
  d.appendChild(c);
  c = Entry.createElement("div");
  c.addClass("entryListSettingLengthWrapperWorkspace");
  d = Entry.createElement("span");
  d.addClass("entryListSettingLengthSpanWorkspace");
  d.innerHTML = Lang.Workspace.number_of_list;
  c.appendChild(d);
  a.appendChild(c);
  d = Entry.createElement("div");
  d.addClass("entryListSettingLengthControllerWorkspace");
  c.appendChild(d);
  c = Entry.createElement("span");
  c.addClass("entryListSettingMinusWorkspace");
  c.bindOnClick(function(a) {
    b.selectedList.array_.pop();
    b.updateListSettingView(b.selectedList);
  });
  d.appendChild(c);
  c = Entry.createElement("input");
  c.addClass("entryListSettingLengthInputWorkspace");
  c.onblur = function() {
    b.setListLength(this.value);
  };
  c.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.lengthInput = c;
  d.appendChild(c);
  c = Entry.createElement("span");
  c.addClass("entryListSettingPlusWorkspace");
  c.bindOnClick(function(a) {
    b.selectedList.array_.push({data:0});
    b.updateListSettingView(b.selectedList);
  });
  d.appendChild(c);
  d = Entry.createElement("div");
  a.seperator = d;
  a.appendChild(d);
  d.addClass("entryListSettingSeperatorWorkspace");
  d = Entry.createElement("div");
  d.addClass("entryListSettingListValuesWorkspace");
  a.listValues = d;
  a.appendChild(d);
};
Entry.VariableContainer.prototype.updateListSettingView = function(b) {
  var a = this;
  b = b || this.selectedList;
  var d = this.listSettingView, c = d.listValues, e = d.visibleCheck, f = d.lengthInput, g = d.seperator;
  e.removeClass("entryListSettingCheckedWorkspace");
  b.isVisible() && e.addClass("entryListSettingCheckedWorkspace");
  f.value = b.array_.length;
  for (b.listElement.appendChild(d);c.firstChild;) {
    c.removeChild(c.firstChild);
  }
  var h = b.array_;
  0 === h.length ? g.addClass("entryRemove") : g.removeClass("entryRemove");
  for (e = 0;e < h.length;e++) {
    (function(d) {
      var e = Entry.createElement("div");
      e.addClass("entryListSettingValueWrapperWorkspace");
      var f = Entry.createElement("span");
      f.addClass("entryListSettingValueNumberSpanWorkspace");
      f.innerHTML = d + 1;
      e.appendChild(f);
      f = Entry.createElement("input");
      f.value = h[d].data;
      f.onblur = function() {
        h[d].data = this.value;
        b.updateView();
      };
      f.onkeypress = function(a) {
        13 == a.keyCode && this.blur();
      };
      f.addClass("entryListSettingEachInputWorkspace");
      e.appendChild(f);
      f = Entry.createElement("span");
      f.bindOnClick(function() {
        h.splice(d, 1);
        a.updateListSettingView();
      });
      f.addClass("entryListSettingValueRemoveWorkspace");
      e.appendChild(f);
      c.appendChild(e);
    })(e);
  }
  b.updateView();
  d.removeClass("entryRemove");
};
Entry.VariableContainer.prototype.setListLength = function(b) {
  b = Number(b);
  var a = this.selectedList.array_;
  if (!isNaN(b)) {
    var d = a.length;
    if (d < b) {
      for (b -= d, d = 0;d < b;d++) {
        a.push({data:0});
      }
    } else {
      d > b && (a.length = b);
    }
  }
  this.updateListSettingView();
};
Entry.VariableContainer.prototype.updateViews = function() {
  var b = this.lists_;
  this.variables_.map(function(a) {
    a.updateView();
  });
  b.map(function(a) {
    a.updateView();
  });
};
Entry.VariableContainer.prototype.updateSelectedVariable = function(b, a) {
  b ? "variable" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "slide" == b.type ? (this.selectedVariable = b, this.updateVariableSettingView(b)) : "list" == b.type && (this.selectedList = b, this.updateListSettingView(b)) : (this.selectedVariable = null, "variable" == (a || "variable") ? this.variableSettingView.addClass("entryRemove") : this.listSettingView.addClass("entryRemove"));
};
Entry.VariableContainer.prototype.removeLocalVariables = function(b) {
  var a = [], d = this;
  this.mapVariable(function(b, d) {
    b.object_ && b.object_ == d && a.push(b);
  }, b);
  a.map(function(a) {
    d.removeVariable(a);
  });
};
Entry.VariableContainer.prototype.updateCloudVariables = function() {
  var b = Entry.projectId;
  if (Entry.cloudSavable && b) {
    var a = Entry.variableContainer, b = a.variables_.filter(function(a) {
      return a.isCloud_;
    }), b = b.map(function(a) {
      return a.toJSON();
    }), a = a.lists_.filter(function(a) {
      return a.isCloud_;
    }), a = a.map(function(a) {
      return a.toJSON();
    });
    $.ajax({url:"/api/project/variable/" + Entry.projectId, type:"PUT", data:{variables:b, lists:a}}).done(function() {
    });
  }
};
Entry.VariableContainer.prototype.addRef = function(b, a) {
  if (this.view_ && Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    var d = {object:a.getCode().object, block:a};
    a.funcBlock && (d.funcBlock = a.funcBlock, delete a.funcBlock);
    this[b].push(d);
    if ("_functionRefs" == b) {
      for (var c = a.type.substr(5), e = Entry.variableContainer.functions_[c].content.getBlockList(), f = 0;f < e.length;f++) {
        a = e[f];
        var g = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == c || (g && g.viewAdd && g.viewAdd.forEach(function(b) {
          a.getCode().object = d.object;
          b && (a.funcBlock = d.block, b(a));
        }), g && g.dataAdd && g.dataAdd.forEach(function(b) {
          a.getCode().object = d.object;
          b && (a.funcBlock = d.block, b(a));
        }));
      }
    }
    return d;
  }
};
Entry.VariableContainer.prototype.removeRef = function(b, a) {
  if (Entry.playground.mainWorkspace.getMode() === Entry.Workspace.MODE_BOARD) {
    for (var d = this[b], c = 0;c < d.length;c++) {
      if (d[c].block == a) {
        d.splice(c, 1);
        break;
      }
    }
    if ("_functionRefs" == b) {
      for (var d = a.type.substr(5), e = Entry.variableContainer.functions_[d].content.getBlockList(), c = 0;c < e.length;c++) {
        a = e[c];
        var f = a.events;
        -1 < a.type.indexOf("func_") && a.type.substr(5) == d || (f && f.viewDestroy && f.viewDestroy.forEach(function(b) {
          b && b(a);
        }), f && f.dataDestroy && f.dataDestroy.forEach(function(b) {
          b && b(a);
        }));
      }
    }
  }
};
Entry.VariableContainer.prototype._getBlockMenu = function() {
  return Entry.playground.mainWorkspace.getBlockMenu();
};
Entry.block.run = {skeleton:"basic", color:"#3BBD70", contents:["this is", "basic block"], func:function() {
}};
Entry.block.mutant = {skeleton:"basic", event:"start", color:"#3BBD70", template:"test mutant block", params:[], func:function() {
}, changeEvent:new Entry.Event};
Entry.block.jr_start = {skeleton:"pebble_event", event:"start", color:"#3BBD70", template:"%1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_play_image.png", highlightColor:"#3BBD70", position:{x:0, y:0}, size:22}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_repeat = {skeleton:"pebble_loop", color:"#127CDB", template:"%1 \ubc18\ubcf5", params:[{type:"Text", text:Lang.Menus.repeat_0}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:3, fontSize:14, roundValue:3}, {type:"Text", text:Lang.Menus.repeat_1}], statements:[], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.jr_item = {skeleton:"pebble_basic", color:"#F46C6C", template:"\uaf43 \ubaa8\uc73c\uae30 %1", params:[{type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_item_image.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.cparty_jr_item = {skeleton:"pebble_basic", color:"#8ABC1D", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.pick_up_pencil}, {type:"Indicator", img:"/img/assets/ntry/bitmap/cpartyjr/pen.png", highlightColor:"#FFF", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GET_ITEM, function() {
      Ntry.dispatchEvent("getItem");
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_north = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_up}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_up_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case Ntry.STATIC.EAST:
        c = b.TURN_LEFT;
        break;
      case Ntry.STATIC.SOUTH:
        c = b.HALF_ROTATION;
        break;
      case Ntry.STATIC.WEST:
        c = b.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_east = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_right}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_right_image.png", position:{x:83, y:0}, size:22}], func:function() {
  var b = Ntry.STATIC;
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        c = b.TURN_LEFT;
        break;
      case b.WEST:
        c = b.HALF_ROTATION;
        break;
      case b.NORTH:
        c = b.TURN_RIGHT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_south = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_down}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_down_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.EAST:
        c = b.TURN_RIGHT;
        break;
      case b.NORTH:
        c = b.HALF_ROTATION;
        break;
      case b.WEST:
        c = b.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_west = {skeleton:"pebble_basic", color:"#A751E3", template:"%1 %2", params:[{type:"Text", text:Lang.Menus.go_left}, {type:"Indicator", img:"/img/assets/ntry/bitmap/jr/block_left_image.png", position:{x:83, y:0}, size:22}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = Ntry.STATIC, a = this, d = function() {
      window.setTimeout(function() {
        Ntry.dispatchEvent("unitAction", b.WALK, function() {
          a.isAction = !1;
        });
      }, 3);
    }, c;
    switch(Ntry.unitComp.direction) {
      case b.SOUTH:
        c = b.TURN_RIGHT;
        break;
      case b.EAST:
        c = b.HALF_ROTATION;
        break;
      case b.NORTH:
        c = b.TURN_LEFT;
        break;
      default:
        d();
    }
    c && Ntry.dispatchEvent("unitAction", c, d);
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_start_basic = {skeleton:"basic_event", event:"start", color:"#3BBD70", template:"%1 %2", params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}, Lang.Menus.maze_when_run], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.jr_go_straight = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.go_forward, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_straight.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_left = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_left, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_l.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_turn_right = {skeleton:"basic", color:"#A751E3", template:"%1 %2", params:[Lang.Menus.jr_turn_right, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_rotate_r.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_go_slow = {skeleton:"basic", color:"#f46c6c", template:"%1 %2", params:[Lang.Menus.go_slow, {type:"Image", img:"/img/assets/ntry/bitmap/jr/cparty_go_slow.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.GO_SLOW, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_repeat_until_dest = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", syntax:["BasicWhile", "true"], params:[Lang.Menus.repeat_until_reach_2, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_goal_image.png", size:18}, Lang.Menus.repeat_until_reach_1, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.jr_if_construction = {skeleton:"basic_loop", color:"#498DEB", template:"%1 %2 %3 %4", params:[Lang.Menus.jr_if_1, {type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_construction_image.png", size:18}, Lang.Menus.jr_if_2, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_REPAIR});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.jr_if_speed = {skeleton:"basic_loop", color:"#498DEB", template:Lang.Menus.jr_if_1 + " %1 " + Lang.Menus.jr_if_2 + " %2", params:[{type:"Image", img:"/img/assets/ntry/bitmap/jr/jr_speed_image.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_SLOW});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_start = {skeleton:"basic_event", mode:"maze", event:"start", color:"#3BBD70", template:"%1 \uc2dc\uc791\ud558\uae30\ub97c \ud074\ub9ad\ud588\uc744 \ub54c", syntax:["Program"], params:[{type:"Indicator", boxMultiplier:2, img:"/img/assets/block_icon/start_icon_play.png", highlightColor:"#3BBD70", size:17, position:{x:0, y:-2}}], func:function() {
  var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a;
  for (a in b) {
    this._unit = b[a];
  }
  Ntry.unitComp = Ntry.entityManager.getComponent(this._unit.id, Ntry.STATIC.UNIT);
}};
Entry.block.maze_step_jump = {skeleton:"basic", mode:"maze", color:"#FF6E4B", template:"\ub6f0\uc5b4\ub118\uae30%1", params:[{type:"Image", img:"/img/assets/week/blocks/jump.png", size:24}], syntax:["Scope", "jump"], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.JUMP, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_for = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ubc88 \ubc18\ubcf5\ud558\uae30%2", syntax:["BasicIteration"], params:[{type:"Dropdown", key:"REPEAT", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (void 0 === this.repeatCount) {
    return this.repeatCount = this.block.params[0], Entry.STATIC.CONTINUE;
  }
  if (0 < this.repeatCount) {
    this.repeatCount--;
    var b = this.block.statements[0];
    if (0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  } else {
    delete this.repeatCount;
  }
}};
Entry.block.test = {skeleton:"basic_boolean_field", mode:"maze", color:"#127CDB", template:"%1 this is test block %2", params:[{type:"Angle", value:"90"}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.maze_repeat_until_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"%1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_repeat_until_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ubaa8\ub4e0 %1 \ub9cc\ub0a0 \ub54c \uae4c\uc9c0 \ubc18\ubcf5%2", syntax:["BasicWhile", "true"], params:[{type:"Image", img:"/img/assets/ntry/block_inner/repeat_goal_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/for.png", size:24}], statements:[{accept:"basic"}], func:function() {
  var b = this.block.statements[0];
  if (0 !== b.getBlocks().length) {
    return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_1 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_1.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    d = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y});
    b = this.block.statements[0];
    if (0 === d.length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_2 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "bee"'], params:[{type:"Image", img:"/img/assets/ntry/bitmap/maze2/obstacle_01.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BEE});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_call_function = {skeleton:"basic", mode:"maze", color:"#B57242", template:"\uc57d\uc18d \ubd88\ub7ec\uc624\uae30%1", syntax:["Scope", "promise"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], func:function() {
  if (!this.funcExecutor) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.CODE), a;
    for (a in b) {
      this.funcExecutor = new Entry.Executor(b[a].components[Ntry.STATIC.CODE].code.getEventMap("define")[0]);
    }
  }
  this.funcExecutor.execute();
  if (null !== this.funcExecutor.scope.block) {
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_define_function = {skeleton:"basic_define", mode:"maze", color:"#B57242", event:"define", template:"\uc57d\uc18d\ud558\uae30%1", syntax:["BasicFunction"], params:[{type:"Image", img:"/img/assets/week/blocks/function.png", size:24}], statements:[{accept:"basic"}], func:function(b) {
  if (!this.executed && (b = this.block.statements[0], 0 !== b.getBlocks().length)) {
    return this.executor.stepInto(b), this.executed = !0, Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_if_3 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "banana"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_3.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.OBSTACLE_BANANA});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_if_4 = {skeleton:"basic_loop", mode:"maze", color:"#498DEB", template:"\ub9cc\uc57d \uc55e\uc5d0 %1 \uc788\ub2e4\uba74%2", syntax:["BasicIf", 'front == "wall"'], params:[{type:"Image", img:"/img/assets/ntry/block_inner/if_target_2.png", size:18}, {type:"Image", img:"/img/assets/week/blocks/if.png", size:24}], statements:[{accept:"basic"}], func:function() {
  if (!this.isContinue) {
    var b = Ntry.entityManager.getEntitiesByComponent(Ntry.STATIC.UNIT), a, d;
    for (d in b) {
      a = b[d];
    }
    b = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.UNIT);
    a = Ntry.entityManager.getComponent(a.id, Ntry.STATIC.GRID);
    a = {x:a.x, y:a.y};
    Ntry.addVectorByDirection(a, b.direction, 1);
    a = Ntry.entityManager.find({type:Ntry.STATIC.GRID, x:a.x, y:a.y}, {type:Ntry.STATIC.TILE, tileType:Ntry.STATIC.WALL});
    this.isContinue = !0;
    b = this.block.statements[0];
    if (0 !== a.length && 0 !== b.getBlocks().length) {
      return this.executor.stepInto(b), Entry.STATIC.CONTINUE;
    }
  }
}};
Entry.block.maze_step_move_step = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc55e\uc73c\ub85c \ud55c \uce78 \uc774\ub3d9%1", syntax:["Scope", "move"], params:[{type:"Image", img:"/img/assets/week/blocks/moveStep.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.WALK, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_left = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc67c\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "left"], params:[{type:"Image", img:"/img/assets/week/blocks/turnL.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_LEFT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.maze_step_rotate_right = {skeleton:"basic", mode:"maze", color:"#A751E3", template:"\uc624\ub978\ucabd\uc73c\ub85c \ud68c\uc804%1", syntax:["Scope", "right"], params:[{type:"Image", img:"/img/assets/week/blocks/turnR.png", size:24}], func:function() {
  if (this.isContinue) {
    if (this.isAction) {
      return Entry.STATIC.CONTINUE;
    }
    delete this.isAction;
    delete this.isContinue;
  } else {
    this.isAction = this.isContinue = !0;
    var b = this;
    Ntry.dispatchEvent("unitAction", Ntry.STATIC.TURN_RIGHT, function() {
      b.isAction = !1;
    });
    return Entry.STATIC.CONTINUE;
  }
}};
Entry.block.test_wrapper = {skeleton:"basic", mode:"maze", color:"#3BBD70", template:"%1 this is test block %2", params:[{type:"Block", accept:"basic_boolean_field", value:[{type:"test", params:[30, 50]}]}, {type:"Dropdown", options:[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10]], value:1}], func:function() {
}};
Entry.block.basic_button = {skeleton:"basic_button", color:"#eee", template:"%1", params:[{type:"Text", text:"basic button", color:"#333", align:"center"}], func:function() {
}};
Entry.BlockMenu = function(b, a, d, c) {
  Entry.Model(this, !1);
  this._align = a || "CENTER";
  this._scroll = void 0 !== c ? c : !1;
  this._bannedClass = [];
  this._categories = [];
  this.suffix = "blockMenu";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.visible = !0;
  this._svgId = "blockMenu" + (new Date).getTime();
  this._clearCategory();
  this._generateView(d);
  this._splitters = [];
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.patternRect = Entry.Utils.addBlockPattern(this.svg, this.suffix);
  this.svgGroup = this.svg.elem("g");
  this.svgThreadGroup = this.svgGroup.elem("g");
  this.svgThreadGroup.board = this;
  this.svgBlockGroup = this.svgGroup.elem("g");
  this.svgBlockGroup.board = this;
  this.changeEvent = new Entry.Event(this);
  d && this._generateCategoryCodes(d);
  this.observe(this, "_handleDragBlock", ["dragBlock"]);
  this._scroll && (this._scroller = new Entry.BlockMenuScroller(this), this._addControl(b));
  Entry.documentMousedown && Entry.documentMousedown.attach(this, this.setSelectedBlock);
  this._categoryCodes && Entry.keyPressed && Entry.keyPressed.attach(this, this._captureKeyEvent);
  Entry.windowResized && (b = _.debounce(this.updateOffset, 200), Entry.windowResized.attach(this, b));
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function(a) {
    var b = this.view, c = this;
    a && (this._categoryCol = Entry.Dom("ul", {class:"entryCategoryListWorkspace", parent:b}), this._generateCategoryView(a));
    this.blockMenuContainer = Entry.Dom("div", {"class":"blockMenuContainer", parent:b});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="blockMenu" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.blockMenuContainer});
    this.svgDom.mouseenter(function(a) {
      c._scroller && c._scroller.setOpacity(1);
      a = c.workspace.selectedBlockView;
      !Entry.playground || Entry.playground.resizing || a && a.dragMode === Entry.DRAG_MODE_DRAG || (Entry.playground.focusBlockMenu = !0, a = c.svgGroup.getBBox(), a = a.width + a.x + 64, a > Entry.interfaceState.menuWidth && (this.widthBackup = Entry.interfaceState.menuWidth - 64, $(this).stop().animate({width:a - 62}, 200)));
    });
    this.svgDom.mouseleave(function(a) {
      Entry.playground && !Entry.playground.resizing && (c._scroller && c._scroller.setOpacity(0), (a = this.widthBackup) && $(this).stop().animate({width:a}, 200), delete this.widthBackup, delete Entry.playground.focusBlockMenu);
    });
    $(window).scroll(function() {
      c.updateOffset();
    });
  };
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.codeListener && this.code.changeEvent.detach(this.codeListener);
    var b = this;
    this.set({code:a});
    this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    });
    a.createView(this);
    this.workspace.getMode();
    this.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD ? a.mode && "code" !== a.mode || this.renderText() : "text" === a.mode && this.renderBlock();
    this.align();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
    this._scroller && this.svgGroup.appendChild(this._scroller.svgGroup);
  };
  b.align = function() {
    if (this.code) {
      this._clearSplitters();
      for (var a = this.code.getThreads(), b = 10, c = "LEFT" == this._align ? 10 : this.svgDom.width() / 2, e, f = 0, g = a.length;f < g;f++) {
        var h = a[f].getFirstBlock(), k = h.view, h = Entry.block[h.type];
        this.checkBanClass(h) ? k.set({display:!1}) : (k.set({display:!0}), h = h.class, e && e !== h && (this._createSplitter(b), b += 15), e = h, h = c - k.offsetX, "CENTER" == this._align && (h -= k.width / 2), b -= k.offsetY, k._moveTo(h, b, !1), b += k.height + 15);
      }
      this.updateSplitters();
      this.changeEvent.notify();
    }
  };
  b.cloneToGlobal = function(a) {
    if (!this._boardBlockView && null !== this.dragBlock) {
      var b = this.workspace, c = b.getMode(), e = this.dragBlock, f = this._svgWidth, g = b.selectedBoard;
      !g || c != Entry.Workspace.MODE_BOARD && c != Entry.Workspace.MODE_OVERLAYBOARD ? Entry.GlobalSvg.setView(e, b.getMode()) && Entry.GlobalSvg.addControl(a) : g.code && (b = e.block, c = b.getThread(), b && c && (b = c.toJSON(!0), this._boardBlockView = Entry.do("addThread", b).value.getFirstBlock().view, g = this.offset().top - g.offset().top, this._boardBlockView._moveTo(e.x - f, e.y + g, !1), this._boardBlockView.onMouseDown.call(this._boardBlockView, a), this._boardBlockView.dragInstance.set({isNew:!0})));
    }
  };
  b.terminateDrag = function() {
    if (this._boardBlockView) {
      var a = this._boardBlockView;
      if (a) {
        this.workspace.getBoard();
        this._boardBlockView = null;
        var b = Entry.GlobalSvg.left, c = Entry.GlobalSvg.width / 2, a = a.getBoard().offset().left;
        return b < a - c;
      }
    }
  };
  b.getCode = function(a) {
    return this._code;
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.renderText = function() {
    var a = this.code.getThreads();
    this.code.mode = "text";
    for (var b = 0;b < a.length;b++) {
      a[b].view.renderText();
    }
  };
  b.renderBlock = function() {
    var a = this.code.getThreads();
    this.code.mode = "code";
    for (var b = 0;b < a.length;b++) {
      a[b].view.renderBlock();
    }
  };
  b._createSplitter = function(a) {
    a = this.svgBlockGroup.elem("line", {x1:20, y1:a, x2:this._svgWidth - 20, y2:a, stroke:"#b5b5b5"});
    this._splitters.push(a);
  };
  b.updateSplitters = function(a) {
    a = void 0 === a ? 0 : a;
    var b = this._svgWidth - 20, c;
    this._splitters.forEach(function(e) {
      c = parseFloat(e.getAttribute("y1")) + a;
      e.attr({x2:b, y1:c, y2:c});
    });
  };
  b._clearSplitters = function() {
    for (var a = this._splitters, b = a.length - 1;0 <= b;b--) {
      a[b].remove(), a.pop();
    }
  };
  b.setWidth = function() {
    this._svgWidth = this.blockMenuContainer.width();
    this.updateSplitters();
  };
  b.setMenu = function() {
    var a = this._categoryCodes, b = this._categoryElems, c;
    for (c in a) {
      var e = a[c];
      e instanceof Entry.Code || (e = a[c] = new Entry.Code(e));
      for (var e = e.getThreads(), f = e.length, g = 0;g < e.length;g++) {
        var h = e[g].getFirstBlock();
        this.checkBanClass(Entry.block[h.type]) && f--;
      }
      0 === f ? b[c].addClass("entryRemove") : b[c].removeClass("entryRemove");
    }
  };
  b.getCategoryCodes = function(a) {
    a = this._convertSelector(a);
    var b = this._categoryCodes[a];
    b instanceof Entry.Code || (b = this._categoryCodes[a] = new Entry.Code(b));
    return b;
  };
  b._convertSelector = function(a) {
    if (isNaN(a)) {
      return a;
    }
    a = Number(a);
    for (var b = this._categories, c = this._categoryElems, e = 0;e < b.length;e++) {
      var f = b[e];
      if (!c[f].hasClass("entryRemove") && 0 === a--) {
        return f;
      }
    }
  };
  b.selectMenu = function(a, b) {
    var c = this._convertSelector(a);
    if (c) {
      "variable" == c && Entry.playground.checkVariables();
      var e = this._categoryElems[c], f = this._selectedCategoryView, g = !1, h = this.workspace.board, k = h.view;
      f && f.removeClass("entrySelectedCategory");
      e != f || b ? f || (this.visible || (g = !0, k.addClass("foldOut"), Entry.playground.showTabs()), k.removeClass("folding"), this.visible = !0) : (k.addClass("folding"), this._selectedCategoryView = null, e.removeClass("entrySelectedCategory"), Entry.playground.hideTabs(), g = !0, this.visible = !1);
      g && Entry.bindAnimationCallbackOnce(k, function() {
        h.scroller.resizeScrollBar.call(h.scroller);
        k.removeClass("foldOut");
        Entry.windowResized.notify();
      });
      this.visible && (f = this._categoryCodes[c], this._selectedCategoryView = e, e.addClass("entrySelectedCategory"), f.constructor !== Entry.Code && (f = this._categoryCodes[c] = new Entry.Code(f)), this.changeCode(f));
      this.lastSelector = c;
    }
  };
  b._generateCategoryCodes = function(a) {
    this._categoryCodes = {};
    for (var b = 0;b < a.length;b++) {
      var c = a[b], e = [];
      c.blocks.forEach(function(a) {
        var b = Entry.block[a];
        if (b && b.def) {
          if (b.defs) {
            for (a = 0;a < b.defs.length;a++) {
              e.push([b.defs[a]]);
            }
          } else {
            e.push([b.def]);
          }
        } else {
          e.push([{type:a}]);
        }
      });
      c = c.category;
      this._categories.push(c);
      this._categoryCodes[c] = e;
    }
  };
  b.banClass = function(a) {
    0 > this._bannedClass.indexOf(a) && this._bannedClass.push(a);
    this.align();
  };
  b.unbanClass = function(a) {
    a = this._bannedClass.indexOf(a);
    -1 < a && this._bannedClass.splice(a, 1);
    this.align();
  };
  b.checkBanClass = function(a) {
    if (a) {
      a = a.isNotFor;
      for (var b in this._bannedClass) {
        if (a && -1 < a.indexOf(this._bannedClass[b])) {
          return !0;
        }
      }
      return !1;
    }
  };
  b._addControl = function(a) {
    var b = this;
    a.on("wheel", function() {
      b._mouseWheel.apply(b, arguments);
    });
  };
  b._mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this._scroller.scroll(-a.wheelDeltaY || a.deltaY / 3);
  };
  b.dominate = function(a) {
    this.svgBlockGroup.appendChild(a.view.svgGroup);
  };
  b.reDraw = function() {
    this.selectMenu(this.lastSelector, !0);
    var a = this.code && this.code.view ? this.code.view : null;
    a && a.reDraw();
  };
  b._handleDragBlock = function() {
    this._boardBlockView = null;
    this._scroller && this._scroller.setOpacity(0);
  };
  b._captureKeyEvent = function(a) {
    var b = a.keyCode, c = Entry.type;
    a.ctrlKey && "workspace" == c && 48 < b && 58 > b && (a.preventDefault(), this.selectMenu(b - 49));
  };
  b.setPatternRectFill = function(a) {
    this.patternRect.attr({fill:a});
  };
  b._clearCategory = function() {
    this._selectedCategoryView = null;
    this._categories = [];
    var a = this._categoryElems, b;
    for (b in a) {
      a[b].remove();
    }
    this._categoryElems = {};
    a = this._categoryCodes;
    for (b in a) {
      var c = a[b];
      c.constructor == Entry.Code && c.clear();
    }
    this._categoryCodes = null;
  };
  b.setCategoryData = function(a) {
    this._clearCategory();
    this._generateCategoryView(a);
    this._generateCategoryCodes(a);
  };
  b._generateCategoryView = function(a) {
    if (a) {
      for (var b = this, c = 0;c < a.length;c++) {
        var e = a[c].category;
        (function(a, c) {
          a.text(Lang.Blocks[c.toUpperCase()]);
          b._categoryElems[c] = a;
          a.bindOnClick(function(a) {
            b.selectMenu(c);
          });
        })(Entry.Dom("li", {id:"entryCategory" + e, class:"entryCategoryElementWorkspace", parent:this._categoryCol}), e);
      }
    }
  };
  b.updateOffset = function() {
    this._offset = this.svgDom.offset();
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
})(Entry.BlockMenu.prototype);
Entry.BlockMenuScroller = function(b) {
  var a = this;
  this.board = b;
  this.board.changeEvent.attach(this, this._reset);
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hX = 0;
  this._visible = !0;
  this._opacity = -1;
  this.mouseHandler = function() {
    a.onMouseDown.apply(a, arguments);
  };
  this.createScrollBar();
  this.setOpacity(0);
  this._addControl();
  Entry.windowResized && Entry.windowResized.attach(this, this.resizeScrollBar);
};
Entry.BlockMenuScroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    this.svgGroup = this.board.svgGroup.elem("g", {class:"boardScrollbar"});
    this.vScrollbar = this.svgGroup.elem("rect", {rx:4, ry:4});
    this.resizeScrollBar();
  };
  b.resizeScrollBar = function() {
    this._updateRatio();
    if (this._visible && 0 !== this.vRatio) {
      var a = this.board.blockMenuContainer;
      this.vScrollbar.attr({width:9, height:a.height() / this.vRatio, x:a.width() - 9});
    }
  };
  b.updateScrollBar = function(a) {
    this.vY += a;
    this.vScrollbar.attr({y:this.vY});
  };
  b.scroll = function(a) {
    this.isVisible() && (a = this._adjustValue(a) - this.vY, 0 !== a && (this.board.code.moveBy(0, -a * this.vRatio), this.updateScrollBar(a)));
  };
  b._adjustValue = function(a) {
    var b = this.board.svgDom.height(), b = b - b / this.vRatio;
    a = this.vY + a;
    a = Math.max(0, a);
    return a = Math.min(b, a);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.isVisible = function() {
    return this._visible;
  };
  b._updateRatio = function() {
    var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), c = a.blockMenuContainer.height(), a = a.offset();
    this.vRatio = b = (b.height + (b.top - a.top) + 10) / c;
    1 >= b ? this.setVisible(!1) : this.setVisible(!0);
  };
  b._reset = function() {
    this.vY = 0;
    this.vScrollbar.attr({y:this.vY});
    this.resizeScrollBar();
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var d = e.dragInstance;
      e.scroll(a.pageY - d.offsetY);
      d.set({offsetY:a.pageY});
    }
    function c(a) {
      $(document).unbind(".scroll");
      delete e.dragInstance;
    }
    var e = this;
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
      Entry.documentMousedown && Entry.documentMousedown.notify(a);
      var f;
      f = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var g = $(document);
      g.bind("mousemove.scroll", b);
      g.bind("mouseup.scroll", c);
      g.bind("touchmove.scroll", b);
      g.bind("touchend.scroll", c);
      e.dragInstance = new Entry.DragInstance({startY:f.pageY, offsetY:f.pageY});
    }
    a.stopPropagation();
  };
  b._addControl = function() {
    $(this.vScrollbar).bind("mousedown touchstart", this.mouseHandler);
  };
})(Entry.BlockMenuScroller.prototype);
Entry.BlockView = function(b, a, d) {
  Entry.Model(this, !1);
  this.block = b;
  this._board = a;
  this._observers = [];
  this.set(b);
  this.svgGroup = a.svgBlockGroup.elem("g");
  this._schema = Entry.block[b.type];
  this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
  var c = this._skeleton = Entry.skeleton[this._schema.skeleton];
  this._contents = [];
  this._statements = [];
  this.magnet = {};
  this._paramMap = {};
  c.magnets && c.magnets(this).next && (this.svgGroup.nextMagnet = this.block, this._nextGroup = this.svgGroup.elem("g"), this._observers.push(this.observe(this, "_updateMagnet", ["contentHeight"])));
  this.isInBlockMenu = this.getBoard() instanceof Entry.BlockMenu;
  var e = this;
  this.mouseHandler = function() {
    var a = e.block.events;
    a && a.mousedown && a.mousedown.forEach(function(a) {
      a(e);
    });
    e.onMouseDown.apply(e, arguments);
  };
  this._startRender(b, d);
  this._observers.push(this.block.observe(this, "_setMovable", ["movable"]));
  this._observers.push(this.block.observe(this, "_setReadOnly", ["movable"]));
  this._observers.push(this.block.observe(this, "_setCopyable", ["copyable"]));
  this._observers.push(this.block.observe(this, "_updateColor", ["deletable"], !1));
  this._observers.push(this.observe(this, "_updateBG", ["magneting"], !1));
  this._observers.push(this.observe(this, "_updateOpacity", ["visible"], !1));
  this._observers.push(this.observe(this, "_updateDisplay", ["display"], !1));
  this._observers.push(this.observe(this, "_updateShadow", ["shadow"]));
  this._observers.push(this.observe(this, "_updateMagnet", ["offsetY"]));
  this._observers.push(a.code.observe(this, "_setBoard", ["board"], !1));
  this.dragMode = Entry.DRAG_MODE_NONE;
  Entry.Utils.disableContextmenu(this.svgGroup.node);
  (a = b.events.viewAdd) && !this.isInBlockMenu && a.forEach(function(a) {
    Entry.Utils.isFunction(a) && a(b);
  });
  if ("function_general" == this.block.type) {
    debugger;
  }
};
Entry.BlockView.PARAM_SPACE = 5;
Entry.BlockView.DRAG_RADIUS = 5;
(function(b) {
  b.schema = {id:0, type:Entry.STATIC.BLOCK_RENDER_MODEL, x:0, y:0, offsetX:0, offsetY:0, width:0, height:0, contentWidth:0, contentHeight:0, magneting:!1, visible:!0, animating:!1, shadow:!0, display:!0};
  b._startRender = function(a, b) {
    var c = this, e = this._skeleton;
    this.svgGroup.attr({class:"block"});
    var f = e.classes;
    f && 0 !== f.length && f.forEach(function(a) {
      c.svgGroup.addClass(a);
    });
    f = e.path(this);
    this.pathGroup = this.svgGroup.elem("g");
    this._updateMagnet();
    this._path = this.pathGroup.elem("path");
    this.getBoard().patternRect && ($(this._path).mouseenter(function(a) {
      c._mouseEnable && c._changeFill(!0);
    }), $(this._path).mouseleave(function(a) {
      c._mouseEnable && c._changeFill(!1);
    }));
    var g = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (g = Entry.Utils.colorLighten(g));
    this._fillColor = g;
    f = {d:f, fill:g, class:"blockPath"};
    if (this.magnet.next || this._skeleton.nextShadow) {
      g = this.getBoard().suffix, this.pathGroup.attr({filter:"url(#entryBlockShadowFilter_" + g + ")"});
    } else {
      if (this.magnet.string || this.magnet.boolean) {
        f.stroke = e.outerLine;
      }
    }
    e.outerLine && (f["stroke-width"] = "0.6");
    this._path.attr(f);
    this._moveTo(this.x, this.y, !1);
    this._startContentRender(b);
    !0 !== this._board.disableMouseEvent && this._addControl();
    this.bindPrev();
  };
  b._startContentRender = function(a) {
    a = void 0 === a ? Entry.Workspace.MODE_BOARD : a;
    this.contentSvgGroup && this.contentSvgGroup.remove();
    var b = this._schema;
    b.statements && b.statements.length && this.statementSvgGroup && this.statementSvgGroup.remove();
    this._contents = [];
    this.contentSvgGroup = this.svgGroup.elem("g");
    b.statements && b.statements.length && (this.statementSvgGroup = this.svgGroup.elem("g"));
    switch(a) {
      case Entry.Workspace.MODE_BOARD:
      ;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        for (var c = /(%\d)/mi, e = (b.template ? b.template : Lang.template[this.block.type]).split(c), f = b.params, g = 0;g < e.length;g++) {
          var h = e[g].trim();
          if (0 !== h.length) {
            if (c.test(h)) {
              var k = Number(h.split("%")[1]) - 1, h = f[k], h = new Entry["Field" + h.type](h, this, k, a, g);
              this._contents.push(h);
              this._paramMap[k] = h;
            } else {
              this._contents.push(new Entry.FieldText({text:h}, this));
            }
          }
        }
        if ((a = b.statements) && a.length) {
          for (g = 0;g < a.length;g++) {
            this._statements.push(new Entry.FieldStatement(a[g], this, g));
          }
        }
        break;
      case Entry.Workspace.MODE_VIMBOARD:
        if ("basic_button" === this._schema.skeleton) {
          this._startContentRender(Entry.Workspace.MODE_BOARD);
          return;
        }
        g = this.getBoard().workspace.getCodeToText(this.block);
        this._contents.push(new Entry.FieldText({text:g, color:"white"}, this));
    }
    this.alignContent(!1);
  };
  b._updateSchema = function() {
    this._startContentRender();
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this._schema = Entry.block[a];
    this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this._updateSchema));
    this._updateSchema();
  };
  b.alignContent = function(a) {
    !0 !== a && (a = !1);
    for (var b = 0, c = 0, e = 0, f = 0, g = 0, h = 0, k = 0;k < this._contents.length;k++) {
      var l = this._contents[k];
      l instanceof Entry.FieldLineBreak ? (this._alignStatement(a, f), l.align(f), f++, c = l.box.y, b = 8) : (l.align(b, c, a), k === this._contents.length - 1 || l instanceof Entry.FieldText && 0 == l._text.length || (b += Entry.BlockView.PARAM_SPACE));
      l = l.box;
      0 !== f ? h = Math.max(1E3 * Math.round(l.height), h) : e = Math.max(l.height, e);
      b += l.width;
      g = Math.max(g, b);
      this.set({contentWidth:g, contentHeight:e});
    }
    this.set({contentHeight:e + h});
    this._statements.length != f && this._alignStatement(a, f);
    a = this.getContentPos();
    this.contentSvgGroup.attr("transform", "translate(" + a.x + "," + a.y + ")");
    this.contentPos = a;
    this._render();
    this._updateMagnet();
  };
  b._alignStatement = function(a, b) {
    var c = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [], e = this._statements[b];
    e && (c = c[b]) && e.align(c.x, c.y, a);
  };
  b._render = function() {
    this._renderPath();
    this.set(this._skeleton.box(this));
  };
  b._renderPath = function() {
    var a = this._skeleton.path(this);
    this._path.attr({d:a});
    this.set({animating:!1});
  };
  b._setPosition = function(a) {
    this.svgGroup.attr("transform", "translate(" + this.x + "," + this.y + ")");
  };
  b._toLocalCoordinate = function(a) {
    this._moveTo(0, 0, !1);
    a.appendChild(this.svgGroup);
  };
  b._toGlobalCoordinate = function(a) {
    a = this.getAbsoluteCoordinate(a);
    this._moveTo(a.x, a.y, !1);
    this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
  };
  b._moveTo = function(a, b, c) {
    this.set({x:a, y:b});
    this.visible && this.display && this._setPosition(c);
  };
  b._moveBy = function(a, b, c) {
    return this._moveTo(this.x + a, this.y + b, c);
  };
  b._addControl = function() {
    var a = this;
    this._mouseEnable = !0;
    $(this.svgGroup).bind("mousedown.blockViewMousedown touchstart.blockViewMousedown", a.mouseHandler);
    var b = a.block.events;
    b && b.dblclick && $(this.svgGroup).dblclick(function() {
      b.dblclick.forEach(function(b) {
        b && b(a);
      });
    });
  };
  b.removeControl = function() {
    this._mouseEnable = !1;
    $(this.svgGroup).unbind(".blockViewMousedown");
  };
  b.onMouseDown = function(a) {
    function d(a) {
      a.stopPropagation();
      var d = e.workspace.getMode(), c;
      d === Entry.Workspace.MODE_VIMBOARD && b.vimBoardEvent(a, "dragOver");
      c = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var f = m.mouseDownCoordinate, f = Math.sqrt(Math.pow(c.pageX - f.x, 2) + Math.pow(c.pageY - f.y, 2));
      (m.dragMode == Entry.DRAG_MODE_DRAG || f > Entry.BlockView.DRAG_RADIUS) && m.movable && (m.isInBlockMenu ? e.cloneToGlobal(a) : (a = !1, m.dragMode != Entry.DRAG_MODE_DRAG && (m._toGlobalCoordinate(), m.dragMode = Entry.DRAG_MODE_DRAG, m.block.getThread().changeEvent.notify(), Entry.GlobalSvg.setView(m, d), a = !0), this.animating && this.set({animating:!1}), 0 === m.dragInstance.height && m.dragInstance.set({height:-1 + m.height}), d = m.dragInstance, m._moveBy(c.pageX - d.offsetX, c.pageY - 
      d.offsetY, !1), d.set({offsetX:c.pageX, offsetY:c.pageY}), Entry.GlobalSvg.position(), m.originPos || (m.originPos = {x:m.x, y:m.y}), a && e.generateCodeMagnetMap(), m._updateCloseBlock()));
    }
    function c(a) {
      $(document).unbind(".block");
      m.terminateDrag(a);
      e && e.set({dragBlock:null});
      m._changeFill(!1);
      Entry.GlobalSvg.remove();
      delete this.mouseDownCoordinate;
      delete m.dragInstance;
    }
    a.stopPropagation && a.stopPropagation();
    a.preventDefault && a.preventDefault();
    this._changeFill(!1);
    var e = this.getBoard();
    Entry.documentMousedown && Entry.documentMousedown.notify(a);
    if (!this.readOnly && !e.viewOnly) {
      e.setSelectedBlock(this);
      this.dominate();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        var f;
        f = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
        this.mouseDownCoordinate = {x:f.pageX, y:f.pageY};
        var g = $(document);
        g.bind("mousemove.block touchmove.block", d);
        g.bind("mouseup.block touchend.block", c);
        this.dragInstance = new Entry.DragInstance({startX:f.pageX, startY:f.pageY, offsetX:f.pageX, offsetY:f.pageY, height:0, mode:!0});
        e.set({dragBlock:this});
        this.addDragging();
        this.dragMode = Entry.DRAG_MODE_MOUSEDOWN;
      } else {
        if (Entry.Utils.isRightButton(a)) {
          var h = this, k = h.block;
          if (this.isInBlockMenu) {
            return;
          }
          f = [];
          var g = {text:"\ube14\ub85d \ubcf5\uc0ac & \ubd99\uc5ec\ub123\uae30", enable:this.copyable, callback:function() {
            Entry.do("cloneBlock", k);
          }}, l = {text:"\ube14\ub85d \ubcf5\uc0ac", enable:this.copyable, callback:function() {
            h.block.copyToClipboard();
          }}, n = {text:"\ube14\ub85d \uc0ad\uc81c", enable:k.isDeletable(), callback:function() {
            Entry.do("destroyBlock", h.block);
          }};
          f.push(g);
          f.push(l);
          f.push(n);
          Entry.ContextMenu.show(f);
        }
      }
      var m = this;
      e.workspace.getMode() === Entry.Workspace.MODE_VIMBOARD && a && document.getElementsByClassName("CodeMirror")[0].dispatchEvent(Entry.Utils.createMouseEvent("dragStart", event));
    }
  };
  b.vimBoardEvent = function(a, b, c) {
    a && (a = Entry.Utils.createMouseEvent(b, a), c && (a.block = c), document.getElementsByClassName("CodeMirror")[0].dispatchEvent(a));
  };
  b.terminateDrag = function(a) {
    var b = this.getBoard(), c = this.dragMode, e = this.block, f = b.workspace.getMode();
    this.removeDragging();
    this.set({visible:!0});
    this.dragMode = Entry.DRAG_MODE_NONE;
    if (f === Entry.Workspace.MODE_VIMBOARD) {
      b instanceof Entry.BlockMenu ? (b.terminateDrag(), this.vimBoardEvent(a, "dragEnd", e)) : b.clear();
    } else {
      if (c === Entry.DRAG_MODE_DRAG) {
        (f = this.dragInstance && this.dragInstance.isNew) && (b.workspace.blockMenu.terminateDrag() || e._updatePos());
        var g = Entry.GlobalSvg;
        a = !1;
        var h = this.block.getPrevBlock(this.block);
        a = !1;
        switch(Entry.GlobalSvg.terminateDrag(this)) {
          case g.DONE:
            g = b.magnetedBlockView;
            g instanceof Entry.BlockView && (g = g.block);
            h && !g ? Entry.do("separateBlock", e) : h || g || f ? g ? ("next" === g.view.magneting ? (h = e.getLastBlock(), this.dragMode = c, b.separate(e), this.dragMode = Entry.DRAG_MODE_NONE, Entry.do("insertBlock", g, h).isPass(f), Entry.ConnectionRipple.setView(g.view).dispose()) : (Entry.do("insertBlock", e, g).isPass(f), a = !0), createjs.Sound.play("entryMagneting")) : Entry.do("moveBlock", e).isPass(f) : e.getThread().view.isGlobal() ? Entry.do("moveBlock", e) : Entry.do("separateBlock", 
            e);
            break;
          case g.RETURN:
            e = this.block;
            c = this.originPos;
            h ? (this.set({animating:!1}), createjs.Sound.play("entryMagneting"), this.bindPrev(h), e.insert(h)) : (f = e.getThread().view.getParent(), f instanceof Entry.Board ? this._moveTo(c.x, c.y, !1) : (createjs.Sound.play("entryMagneting"), Entry.do("insertBlock", e, f)));
            break;
          case g.REMOVE:
            createjs.Sound.play("entryDelete"), f ? this.block.destroy(!1, !0) : this.block.doDestroyBelow(!1);
        }
        b.setMagnetedBlock(null);
        a && Entry.ConnectionRipple.setView(e.view).dispose();
      }
    }
    this.destroyShadow();
    delete this.originPos;
    this.dominate();
  };
  b._updateCloseBlock = function() {
    var a = this.getBoard(), b;
    if (this._skeleton.magnets) {
      for (var c in this.magnet) {
        if (b = "next" === c ? this.getBoard().getNearestMagnet(this.x, this.y + this.getBelowHeight(), c) : this.getBoard().getNearestMagnet(this.x, this.y, c)) {
          return a.setMagnetedBlock(b.view, c);
        }
      }
      a.setMagnetedBlock(null);
    }
  };
  b.dominate = function() {
    this.block.getThread().view.dominate();
  };
  b.getSvgRoot = function() {
    for (var a = this.getBoard().svgBlockGroup, b = this.svgGroup;b.parentNode !== a;) {
      b = b.parentNode;
    }
    return b;
  };
  b.getBoard = function() {
    return this._board;
  };
  b._setBoard = function() {
    this._board = this._board.code.board;
  };
  b.destroy = function(a) {
    this._destroyObservers();
    var b = this.svgGroup;
    a ? $(b).fadeOut(100, function() {
      b.remove();
    }) : b.remove();
    this._contents.forEach(function(a) {
      a.constructor !== Entry.Block && a.destroy();
    });
    var c = this.block;
    (a = c.events.viewDestroy) && !this.isInBlockMenu && a.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(c);
    });
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
  };
  b.getShadow = function() {
    this._shadow || (this._shadow = Entry.SVG.createElement(this.svgGroup.cloneNode(!0), {opacity:.5}), this.getBoard().svgGroup.appendChild(this._shadow));
    return this._shadow;
  };
  b.destroyShadow = function() {
    this._shadow && (this._shadow.remove(), delete this._shadow);
  };
  b._updateMagnet = function() {
    if (this._skeleton.magnets) {
      var a = this._skeleton.magnets(this);
      a.next && this._nextGroup.attr("transform", "translate(" + a.next.x + "," + a.next.y + ")");
      this.magnet = a;
      this.block.getThread().changeEvent.notify();
    }
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      var a = this.svgGroup;
      if (this.magnet.next) {
        if (a = this.magneting) {
          var b = this._board.dragBlock.getShadow(), c = this.getAbsoluteCoordinate(), e;
          if ("previous" === a) {
            e = this.magnet.next, e = "translate(" + (c.x + e.x) + "," + (c.y + e.y) + ")";
          } else {
            if ("next" === a) {
              e = this.magnet.previous;
              var f = this._board.dragBlock.getBelowHeight();
              e = "translate(" + (c.x + e.x) + "," + (c.y + e.y - f) + ")";
            }
          }
          $(b).attr({transform:e, display:"block"});
          this._clonedShadow = b;
          this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
          "previous" === a && (a = this._board.dragBlock.getBelowHeight() + this.offsetY, this.originalHeight = this.offsetY, this.set({offsetY:a}));
        } else {
          this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), this.set({offsetY:a}), delete this.originalHeight);
        }
        (a = this.block.thread.changeEvent) && a.notify();
      } else {
        this.magneting ? (a.attr({filter:"url(#entryBlockHighlightFilter_" + this.getBoard().suffix + ")"}), a.addClass("outputHighlight")) : (a.removeClass("outputHighlight"), a.removeAttr("filter"));
      }
    }
  };
  b.addDragging = function() {
    this.svgGroup.addClass("dragging");
  };
  b.removeDragging = function() {
    this.svgGroup.removeClass("dragging");
  };
  b.addSelected = function() {
    this.svgGroup.addClass("selected");
  };
  b.removeSelected = function() {
    this.svgGroup.removeClass("selected");
  };
  b.getSkeleton = function() {
    return this._skeleton;
  };
  b.getContentPos = function() {
    return this._skeleton.contentPos(this);
  };
  b.renderText = function() {
    this._startContentRender(Entry.Workspace.MODE_VIMBOARD);
  };
  b.renderBlock = function() {
    this._startContentRender(Entry.Workspace.MODE_BOARD);
  };
  b._updateOpacity = function() {
    this.svgGroup.attr({opacity:!1 === this.visible ? 0 : 1});
    this.visible && this._setPosition();
  };
  b._updateShadow = function() {
    this.shadow && Entry.Utils.colorDarken(this._schema.color, .7);
  };
  b._setMovable = function() {
    this.movable = null !== this.block.isMovable() ? this.block.isMovable() : void 0 !== this._skeleton.movable ? this._skeleton.movable : !0;
  };
  b._setReadOnly = function() {
    this.readOnly = null !== this.block.isReadOnly() ? this.block.isReadOnly() : void 0 !== this._skeleton.readOnly ? this._skeleton.readOnly : !1;
  };
  b._setCopyable = function() {
    this.copyable = null !== this.block.isCopyable() ? this.block.isCopyable() : void 0 !== this._skeleton.copyable ? this._skeleton.copyable : !0;
  };
  b.bumpAway = function(a, b) {
    var c = this;
    a = a || 15;
    b ? window.setTimeout(function() {
      c._moveBy(a, a, !1);
    }, b) : c._moveBy(a, a, !1);
  };
  b.bindPrev = function(a) {
    if (a) {
      if (this._toLocalCoordinate(a.view._nextGroup), (a = a.getNextBlock()) && a !== this.block) {
        var b = this.block.getLastBlock();
        b.view.magnet.next ? a.view._toLocalCoordinate(b.view._nextGroup) : (a.view._toGlobalCoordinate(), a.separate(), a.view.bumpAway(null, 100));
      }
    } else {
      if (a = this.block.getPrevBlock()) {
        this._toLocalCoordinate(a.view._nextGroup), (a = this.block.getNextBlock()) && a.view && a.view._toLocalCoordinate(this._nextGroup);
      }
    }
  };
  b.getAbsoluteCoordinate = function(a) {
    a = void 0 !== a ? a : this.dragMode;
    if (a === Entry.DRAG_MODE_DRAG) {
      return {x:this.x, y:this.y};
    }
    a = this.block.getThread().view.requestAbsoluteCoordinate(this);
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.getBelowHeight = function() {
    return this.block.getThread().view.requestPartHeight(this);
  };
  b._updateDisplay = function() {
    this.svgGroup.attr({display:!1 === this.display ? "none" : "block"});
    this.display && this._setPosition();
  };
  b._updateColor = function() {
    var a = this._schema.color;
    this.block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN && (a = Entry.Utils.colorLighten(a));
    this._fillColor = a;
    this._path.attr({fill:a});
    this._updateContents();
  };
  b._updateContents = function() {
    for (var a = 0;a < this._contents.length;a++) {
      this._contents[a].renderStart();
    }
    this.alignContent(!1);
  };
  b._destroyObservers = function() {
    for (var a = this._observers;a.length;) {
      a.pop().destroy();
    }
  };
  b._changeFill = function(a) {
    var b = this.getBoard();
    if (b.patternRect && !b.dragBlock) {
      var c = this._path, e = this._fillColor;
      a && (b = this.getBoard(), b.setPatternRectFill(e), e = "url(#blockHoverPattern_" + this.getBoard().suffix + ")");
      c.attr({fill:e});
    }
  };
  b.addActivated = function() {
    this.svgGroup.addClass("activated");
  };
  b.removeActivated = function() {
    this.svgGroup.removeClass("activated");
  };
  b.reDraw = function() {
    if (this.visible) {
      var a = this.block;
      this._updateContents();
      var b = a.params;
      if (b) {
        for (var c = 0;c < b.length;c++) {
          var e = b[c];
          e instanceof Entry.Block && e.view.reDraw();
        }
      }
      if (a = a.statements) {
        for (c = 0;c < a.length;c++) {
          a[c].view.reDraw();
        }
      }
    }
  };
  b.getParam = function(a) {
    return this._paramMap[a];
  };
})(Entry.BlockView.prototype);
Entry.Code = function(b, a) {
  Entry.Model(this, !1);
  a && (this.object = a);
  this._data = new Entry.Collection;
  this._eventMap = {};
  this._blockMap = {};
  this.executors = [];
  this.executeEndEvent = new Entry.Event(this);
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this._handleChange);
  this._maxZIndex = 0;
  this.load(b);
};
Entry.STATEMENT = 0;
Entry.PARAM = -1;
(function(b) {
  b.schema = {view:null, board:null};
  b.load = function(a) {
    a instanceof Array || (a = JSON.parse(a));
    this.clear();
    for (var b = 0;b < a.length;b++) {
      this._data.push(new Entry.Thread(a[b], this));
    }
    return this;
  };
  b.clear = function() {
    for (var a = this._data.length - 1;0 <= a;a--) {
      this._data[a].destroy(!1);
    }
    this.clearExecutors();
    this._eventMap = {};
  };
  b.createView = function(a) {
    null === this.view ? this.set({view:new Entry.CodeView(this, a), board:a}) : (this.set({board:a}), a.bindCodeView(this.view));
  };
  b.registerEvent = function(a, b) {
    this._eventMap[b] || (this._eventMap[b] = []);
    this._eventMap[b].push(a);
  };
  b.unregisterEvent = function(a, b) {
    var c = this._eventMap[b];
    if (c && 0 !== c.length) {
      var e = c.indexOf(a);
      0 > e || c.splice(e, 1);
    }
  };
  b.raiseEvent = function(a, b, c) {
    a = this._eventMap[a];
    var e = [];
    if (void 0 !== a) {
      for (var f = 0;f < a.length;f++) {
        var g = a[f];
        if (void 0 === c || -1 < g.params.indexOf(c)) {
          g = new Entry.Executor(a[f], b), this.executors.push(g), e.push(g);
        }
      }
      return e;
    }
  };
  b.getEventMap = function(a) {
    return this._eventMap[a];
  };
  b.map = function(a) {
    this._data.map(a);
  };
  b.tick = function() {
    for (var a = this.executors, b = 0;b < a.length;b++) {
      var c = a[b];
      c.isEnd() || c.execute();
      c.isEnd() && (a.splice(b, 1), b--, 0 === a.length && this.executeEndEvent.notify());
    }
  };
  b.removeExecutor = function(a) {
    a = this.executors.indexOf(a);
    -1 < a && this.executors.splice(a, 1);
  };
  b.clearExecutors = function() {
    this.executors = [];
  };
  b.clearExecutorsByEntity = function(a) {
    for (var b = this.executors, c = 0;c < b.length;c++) {
      var e = b[c];
      e.entity === a && e.end();
    }
  };
  b.addExecutor = function(a) {
    this.executors.push(a);
  };
  b.createThread = function(a, b) {
    if (!(a instanceof Array)) {
      return console.error("blocks must be array");
    }
    var c = new Entry.Thread(a, this);
    void 0 === b ? this._data.push(c) : this._data.insert(c, b);
    return c;
  };
  b.cloneThread = function(a, b) {
    var c = a.clone(this, b);
    this._data.push(c);
    return c;
  };
  b.destroyThread = function(a, b) {
    var c = this._data, e = c.indexOf(a);
    0 > e || c.splice(e, 1);
  };
  b.doDestroyThread = function(a, b) {
    var c = this._data, e = c.indexOf(a);
    0 > e || c.splice(e, 1);
  };
  b.getThreads = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.toJSON = function() {
    for (var a = this.getThreads(), b = [], c = 0, e = a.length;c < e;c++) {
      b.push(a[c].toJSON());
    }
    return b;
  };
  b.countBlock = function() {
    for (var a = this.getThreads(), b = 0, c = 0;c < a.length;c++) {
      b += a[c].countBlock();
    }
    return b;
  };
  b.moveBy = function(a, b) {
    for (var c = this.getThreads(), e = 0, f = c.length;e < f;e++) {
      var g = c[e].getFirstBlock();
      g && g.view._moveBy(a, b, !1);
    }
    c = this.board;
    c instanceof Entry.BlockMenu && c.updateSplitters(b);
  };
  b.stringify = function() {
    return JSON.stringify(this.toJSON());
  };
  b.dominate = function(a) {
    a.view.setZIndex(this._maxZIndex++);
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b._handleChange = function() {
    Entry.creationChangedEvent && Entry.creationChangedEvent.notify();
  };
  b.hasBlockType = function(a) {
    for (var b = this.getThreads(), c = 0;c < b.length;c++) {
      if (b[c].hasBlockType(a)) {
        return !0;
      }
    }
    return !1;
  };
  b.findById = function(a) {
    return this._blockMap[a];
  };
  b.registerBlock = function(a) {
    this._blockMap[a.id] = a;
  };
  b.unregisterBlock = function(a) {
    delete this._blockMap[a.id];
  };
  b.getByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    for (var b = this._data[a.shift()].getBlock(a.shift());a.length;) {
      b instanceof Entry.Block || (b = b.getValueBlock());
      var c = a.shift(), e = a.shift();
      -1 < c ? b = b.statements[c].getBlock(e) : -1 === c && (b = b.view.getParam(e));
    }
    return b;
  };
  b.getTargetByPointer = function(a) {
    a = a.concat();
    a.shift();
    a.shift();
    var b = this._data[a.shift()], c;
    if (1 === a.length) {
      c = b.getBlock(a.shift() - 1);
    } else {
      for (c = b.getBlock(a.shift());a.length;) {
        c instanceof Entry.Block || (c = c.getValueBlock());
        var e = a.shift(), b = a.shift();
        -1 < e ? (c = c.statements[e], c = a.length ? c.getBlock(b) : 0 === b ? c.view.getParent() : c.getBlock(b - 1)) : -1 === e && (c = c.view.getParam(b));
      }
    }
    return c;
  };
  b.getBlockList = function(a) {
    for (var b = this.getThreads(), c = [], e = 0;e < b.length;e++) {
      c = c.concat(b[e].getBlockList(a));
    }
    return c;
  };
})(Entry.Code.prototype);
Entry.CodeView = function(b, a) {
  Entry.Model(this, !1);
  this.code = b;
  this.set({board:a});
  this.svgThreadGroup = a.svgGroup.elem("g");
  this.svgThreadGroup.attr({class:"svgThreadGroup"});
  this.svgThreadGroup.board = a;
  this.svgBlockGroup = a.svgGroup.elem("g");
  this.svgBlockGroup.attr({class:"svgBlockGroup"});
  this.svgBlockGroup.board = a;
  a.bindCodeView(this);
  this.code.map(function(b) {
    b.createView(a);
  });
  b.observe(this, "_setBoard", ["board"]);
};
(function(b) {
  b.schema = {board:null, scrollX:0, scrollY:0};
  b._setBoard = function() {
    this.set({board:this.code.board});
  };
  b.reDraw = function() {
    this.code.map(function(a) {
      a.view.reDraw();
    });
  };
})(Entry.CodeView.prototype);
Entry.ConnectionRipple = {};
(function(b) {
  b.createDom = function(a) {
    this.svgDom || (this._ripple = a.getBoard().svgGroup.elem("circle", {cx:0, cy:0, r:0, stroke:"#888", "stroke-width":10}));
  };
  b.setView = function(a) {
    this._ripple || this.createDom(a);
    var b = this._ripple, c = a.getBoard().svgGroup;
    b.remove();
    a = a.getAbsoluteCoordinate();
    b.attr({cx:a.x, cy:a.y});
    c.appendChild(b);
    b._startTime = new Date;
    return this;
  };
  b.dispose = function() {
    var a = this, b = this._ripple, c = (new Date - b._startTime) / 150;
    1 < c ? b.remove() : (b.attr({r:25 * c, opacity:1 - c}), window.setTimeout(function() {
      a.dispose();
    }, 10));
  };
})(Entry.ConnectionRipple);
Entry.Executor = function(b, a) {
  this.scope = new Entry.Scope(b, this);
  this.entity = a;
  this._callStack = [];
  this.register = {};
};
(function(b) {
  b.execute = function() {
    if (!this.isEnd()) {
      for (;;) {
        try {
          var a = this.scope.block.getSchema().func.call(this.scope, this.entity, this.scope);
        } catch (b) {
          Entry.Utils.stopProjectWithToast(this.scope.block, "\ub7f0\ud0c0\uc784 \uc5d0\ub7ec");
        }
        if (void 0 === a || null === a || a === Entry.STATIC.PASS) {
          if (this.scope = new Entry.Scope(this.scope.block.getNextBlock(), this), null === this.scope.block) {
            if (this._callStack.length) {
              var d = this.scope;
              this.scope = this._callStack.pop();
              if (this.scope.isLooped !== d.isLooped) {
                break;
              }
            } else {
              break;
            }
          }
        } else {
          if (a !== Entry.STATIC.CONTINUE && (a === Entry.STATIC.BREAK || this.scope === a)) {
            break;
          }
        }
      }
    }
  };
  b.stepInto = function(a) {
    a instanceof Entry.Thread || console.error("Must step in to thread");
    a = a.getFirstBlock();
    if (!a) {
      return Entry.STATIC.BREAK;
    }
    this._callStack.push(this.scope);
    this.scope = new Entry.Scope(a, this);
    return Entry.STATIC.CONTINUE;
  };
  b.break = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    return Entry.STATIC.PASS;
  };
  b.breakLoop = function() {
    this._callStack.length && (this.scope = this._callStack.pop());
    for (;this._callStack.length && "repeat" !== Entry.block[this.scope.block.type].class;) {
      this.scope = this._callStack.pop();
    }
    return Entry.STATIC.PASS;
  };
  b.end = function() {
    this.scope.block = null;
  };
  b.isEnd = function() {
    return null === this.scope.block;
  };
})(Entry.Executor.prototype);
Entry.Scope = function(b, a) {
  this.type = (this.block = b) ? b.type : null;
  this.executor = a;
  this.entity = a.entity;
};
(function(b) {
  b.callReturn = function() {
  };
  b.getParam = function(a) {
    a = this.block.params[a];
    var b = new Entry.Scope(a, this.executor);
    return Entry.block[a.type].func.call(b, this.entity, b);
  };
  b.getParams = function() {
    var a = this;
    return this.block.params.map(function(b) {
      if (b instanceof Entry.Block) {
        var c = new Entry.Scope(b, a.executor);
        return Entry.block[b.type].func.call(c, a.entity, c);
      }
      return b;
    });
  };
  b.getValue = function(a, b) {
    var c = this.block.params[this._getParamIndex(a, b)], e = new Entry.Scope(c, this.executor);
    return Entry.block[c.type].func.call(e, this.entity, e);
  };
  b.getStringValue = function(a, b) {
    return String(this.getValue(a, b));
  };
  b.getNumberValue = function(a, b) {
    return Number(this.getValue(a));
  };
  b.getBooleanValue = function(a, b) {
    return Number(this.getValue(a, b)) ? !0 : !1;
  };
  b.getField = function(a, b) {
    return this.block.params[this._getParamIndex(a)];
  };
  b.getStringField = function(a, b) {
    return String(this.getField(a));
  };
  b.getNumberField = function(a) {
    return Number(this.getField(a));
  };
  b.getStatement = function(a, b) {
    return this.executor.stepInto(this.block.statements[this._getStatementIndex(a, b)]);
  };
  b._getParamIndex = function(a) {
    return Entry.block[this.type].paramsKeyMap[a];
  };
  b._getStatementIndex = function(a) {
    return Entry.block[this.type].statementsKeyMap[a];
  };
  b.die = function() {
    this.block = null;
    return Entry.STATIC.BREAK;
  };
})(Entry.Scope.prototype);
Entry.Field = function() {
};
(function(b) {
  b.TEXT_LIMIT_LENGTH = 20;
  b.destroy = function() {
    this.destroyOption();
  };
  b.command = function() {
    this._startValue && (this._startValue === this.getValue() || this._blockView.isInBlockMenu || Entry.do("setFieldValue", this._block, this, this.pointer(), this._startValue, this.getValue()));
    delete this._startValue;
  };
  b.destroyOption = function() {
    this.documentDownEvent && (Entry.documentMousedown.detach(this.documentDownEvent), delete this.documentDownEvent);
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.command();
  };
  b._attachDisposeEvent = function(a) {
    var b = this;
    b.disposeEvent = Entry.disposeEvent.attach(b, a || function() {
      b.destroyOption();
    });
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.getAbsolutePosFromBoard = function() {
    var a = this._block.view, b = a.getContentPos(), a = a.getAbsoluteCoordinate();
    return {x:a.x + this.box.x + b.x, y:a.y + this.box.y + b.y};
  };
  b.getAbsolutePosFromDocument = function() {
    var a = this._block.view, b = a.getContentPos(), c = a.getAbsoluteCoordinate(), a = a.getBoard().svgDom.offset();
    return {x:c.x + this.box.x + b.x + a.left, y:c.y + this.box.y + b.y + a.top};
  };
  b.getRelativePos = function() {
    var a = this._block.view.getContentPos(), b = this.box;
    return {x:b.x + a.x, y:b.y + a.y};
  };
  b.truncate = function() {
    var a = String(this.getValue()), b = this.TEXT_LIMIT_LENGTH, c = a.substring(0, b);
    a.length > b && (c += "...");
    return c;
  };
  b.appendSvgOptionGroup = function() {
    return this._block.view.getBoard().svgGroup.elem("g");
  };
  b.getValue = function() {
    return this._block.params[this._index];
  };
  b.setValue = function(a, b) {
    this.value != a && (this.value = a, this._block.params[this._index] = a, b && this._blockView.reDraw());
  };
  b._isEditable = function() {
    if (this._block.view.dragMode == Entry.DRAG_MODE_DRAG) {
      return !1;
    }
    var a = this._block.view, b = a.getBoard();
    if (!0 === b.disableMouseEvent) {
      return !1;
    }
    var c = b.workspace.selectedBlockView;
    if (!c || b != c.getBoard()) {
      return !1;
    }
    b = a.getSvgRoot();
    return b == c.svgGroup || $(b).has($(a.svgGroup));
  };
  b._selectBlockView = function() {
    var a = this._block.view;
    a.getBoard().setSelectedBlock(a);
  };
  b._bindRenderOptions = function() {
    var a = this;
    $(this.svgGroup).bind("mouseup touchend", function(b) {
      a._isEditable() && (a.destroyOption(), a._startValue = a.getValue(), a.renderOptions());
    });
  };
  b.pointer = function(a) {
    a = a || [];
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.Field.prototype);
Entry.FieldAngle = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  b = this.getValue();
  this.setValue(this.modValue(void 0 !== b ? b : 90));
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldAngle);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:4, y:4, "font-size":"9pt"});
    this.textElement.textContent = this.getText();
    var a = this.getTextWidth(), b = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:b - 8, rx:3, ry:3, width:a, height:16, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.value);
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var d = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:16, left:b.x, top:b.y, width:a.box.width});
    this.optionGroup.select();
    this.svgOptionGroup = this.appendSvgOptionGroup();
    this.svgOptionGroup.elem("circle", {x:0, y:0, r:49, class:"entry-field-angle-circle"});
    this._dividerGroup = this.svgOptionGroup.elem("g");
    for (b = 0;360 > b;b += 15) {
      this._dividerGroup.elem("line", {x1:49, y1:0, x2:49 - (0 === b % 45 ? 10 : 5), y2:0, transform:"rotate(" + b + ", 0, 0)", class:"entry-angle-divider"});
    }
    b = this.getAbsolutePosFromBoard();
    b.x += this.box.width / 2;
    b.y = b.y + this.box.height / 2 + 49 + 1;
    this.svgOptionGroup.attr({class:"entry-field-angle", transform:"translate(" + b.x + "," + b.y + ")"});
    var b = a.getAbsolutePosFromDocument(), c = [b.x + a.box.width / 2, b.y + a.box.height / 2 + 1];
    $(this.svgOptionGroup).mousemove(function(b) {
      a.optionGroup.val(a.modValue(function(a, b) {
        var d = b[0] - a[0], c = b[1] - a[1] - 49 - 1, e = Math.atan(-c / d), e = Entry.toDegrees(e), e = 90 - e;
        0 > d ? e += 180 : 0 < c && (e += 360);
        return 15 * Math.round(e / 15);
      }(c, [b.clientX, b.clientY])));
      a.applyValue();
    });
    this.updateGraph();
  };
  b.updateGraph = function() {
    this._fillPath && this._fillPath.remove();
    var a = Entry.toRadian(this.getValue()), b = 49 * Math.sin(a), c = -49 * Math.cos(a), a = a > Math.PI ? 1 : 0;
    this._fillPath = this.svgOptionGroup.elem("path", {d:"M 0,0 v -49 A 49,49 0 %LARGE 1 %X,%Y z".replace("%X", b).replace("%Y", c).replace("%LARGE", a), class:"entry-angle-fill-area"});
    this.svgOptionGroup.appendChild(this._dividerGroup);
    this._indicator && this._indicator.remove();
    this._indicator = this.svgOptionGroup.elem("line", {x1:0, y1:0, x2:b, y2:c});
    this._indicator.attr({class:"entry-angle-indicator"});
  };
  b.applyValue = function() {
    var a = this.optionGroup.val();
    isNaN(a) || (a = this.modValue(a), this.setValue(a), this.updateGraph(), this.textElement.textContent = this.getValue(), this.optionGroup && this.optionGroup.val(a), this.resize());
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup && this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement ? this.textElement.getComputedTextLength() + 8 : 8;
  };
  b.getText = function() {
    return this.getValue() + "\u00b0";
  };
  b.modValue = function(a) {
    return a % 360;
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.documentDownEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this.svgOptionGroup && (this.svgOptionGroup.remove(), delete this.svgOptionGroup);
    this.textElement.textContent = this.getText();
    this.command();
  };
})(Entry.FieldAngle.prototype);
Entry.FieldBlock = function(b, a, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this._restoreCurrent = b.restore;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldBlock);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view && (c.setThread(this), c.createView(a, b), c.getThread().view.setParent(this));
    this.updateValueBlock(c);
    this._blockView.getBoard().constructor !== Entry.Board && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:15, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b.inspectBlock = function() {
    var a = null;
    if (this._originBlock) {
      a = this._originBlock.type, delete this._originBlock;
    } else {
      switch(this.acceptType) {
        case "boolean":
          a = "True";
          break;
        case "string":
          a = "text";
          break;
        case "param":
          a = "function_field_label";
      }
    }
    return this._createBlockByType(a);
  };
  b._setValueBlock = function(a) {
    this._restoreCurrent && (this._originBlock = this._valueBlock);
    a || (a = this.inspectBlock());
    this._valueBlock = a;
    this.setValue(a);
    a.setThread(this);
    a.getThread().view.setParent(this);
    return this._valueBlock;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    this._destroyObservers();
    a = this._setValueBlock(a).view;
    a.bindPrev(this);
    this._blockView.alignContent();
    this._posObserver = a.observe(this, "updateValueBlock", ["x", "y"], !1);
    this._sizeObserver = a.observe(this, "calcWH", ["width", "height"]);
    a = this._blockView.getBoard();
    a.constructor === Entry.Board && a.generateCodeMagnetMap();
  };
  b._destroyObservers = function() {
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? [a] : null;
  };
  b.replace = function(a) {
    "string" === typeof a && (a = this._createBlockByType(a));
    var b = this._valueBlock;
    Entry.block[b.type].isPrimitive ? (b.doNotSplice = !0, b.destroy()) : "param" === this.acceptType ? (this._destroyObservers(), b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b)) : (this._destroyObservers(), b.view._toGlobalCoordinate(), this.separate(b), b.view.bumpAway(30, 150));
    this.updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
    this.changeEvent.notify();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b._createBlockByType = function(a) {
    this._block.getThread();
    var b = this._blockView.getBoard();
    a = new Entry.Block({type:a}, this);
    var c = b.workspace, e;
    c && (e = c.getMode());
    a.createView(b, e);
    return a;
  };
  b.spliceBlock = function() {
    this.updateValueBlock();
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m 8,12 l -4,0 -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2 l 4,0 z", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0,12)"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.getThread = function() {
    return this;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldBlock.prototype);
Entry.FieldColor = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = d;
  this._position = b.position;
  this.key = b.key;
  this.setValue(this.getValue() || "#FF0000");
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldColor);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-field-color"});
    var a = this._position, b;
    a ? (b = a.x || 0, a = a.y || 0) : (b = 0, a = -8);
    this._header = this.svgGroup.elem("rect", {x:b, y:a, width:14.5, height:16, fill:this.getValue()});
    this._bindRenderOptions();
    this.box.set({x:b, y:a, width:14.5, height:16});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    var b = Entry.FieldColor.getWidgetColorList();
    this.optionGroup = Entry.Dom("table", {class:"entry-widget-color-table", parent:$("body")});
    for (var c = 0;c < b.length;c++) {
      for (var e = Entry.Dom("tr", {class:"entry-widget-color-row", parent:this.optionGroup}), f = 0;f < b[c].length;f++) {
        var g = Entry.Dom("td", {class:"entry-widget-color-cell", parent:e}), h = b[c][f];
        g.css({"background-color":h});
        g.attr({"data-color-value":h});
        (function(b, d) {
          b.mousedown(function(a) {
            a.stopPropagation();
          });
          b.mouseup(function(b) {
            a.applyValue(d);
            a.destroyOption();
            a._selectBlockView();
          });
        })(g, h);
      }
    }
    b = this.getAbsolutePosFromDocument();
    b.y += this.box.height / 2 + 1;
    this.optionGroup.css({left:b.x, top:b.y});
  };
  b.applyValue = function(a) {
    this.value != a && (this.setValue(a), this._header.attr({fill:a}));
  };
})(Entry.FieldColor.prototype);
Entry.FieldColor.getWidgetColorList = function() {
  return ["#FFFFFF #CCCCCC #C0C0C0 #999999 #666666 #333333 #000000".split(" "), "#FFCCCC #FF6666 #FF0000 #CC0000 #990000 #660000 #330000".split(" "), "#FFCC99 #FF9966 #FF9900 #FF6600 #CC6600 #993300 #663300".split(" "), "#FFFF99 #FFFF66 #FFCC66 #FFCC33 #CC9933 #996633 #663333".split(" "), "#FFFFCC #FFFF33 #FFFF00 #FFCC00 #999900 #666600 #333300".split(" "), "#99FF99 #66FF99 #33FF33 #33CC00 #009900 #006600 #003300".split(" "), "#99FFFF #33FFFF #66CCCC #00CCCC #339999 #336666 #003333".split(" "), "#CCFFFF #66FFFF #33CCFF #3366FF #3333FF #000099 #000066".split(" "), 
  "#CCCCFF #9999FF #6666CC #6633FF #6609CC #333399 #330099".split(" "), "#FFCCFF #FF99FF #CC66CC #CC33CC #993399 #663366 #330033".split(" ")];
};
Entry.FieldDropdown = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._noArrow = b.noArrow;
  this._arrowColor = b.arrowColor;
  this._index = d;
  this.setValue(this.getValue());
  this._CONTENT_HEIGHT = b.dropdownHeight || a.getSkeleton().dropdownHeight || 16;
  this._FONT_SIZE = b.fontSize || a.getSkeleton().fontSize || 12;
  this._ROUND = b.roundValue || 3;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldDropdown);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this instanceof Entry.FieldDropdownDynamic && this._updateValue();
    var a = this._blockView;
    this.svgGroup = a.contentSvgGroup.elem("g", {class:"entry-field-dropdown"});
    this.textElement = this.svgGroup.elem("text", {x:2});
    this.textElement.textContent = this.getTextByValue(this.getValue());
    var b = this.textElement.getBBox();
    this.textElement.attr({style:"white-space: pre; font-size:" + this._FONT_SIZE + "px", y:.25 * b.height});
    b = this.textElement.getComputedTextLength() + 16;
    this._noArrow && (b -= 12);
    var c = this._CONTENT_HEIGHT;
    this._header = this.svgGroup.elem("rect", {width:b, height:c, y:-c / 2, rx:this._ROUND, ry:this._ROUND, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._noArrow || (a = this._arrowColor || a._schema.color, this._arrow = this.svgGroup.elem("polygon", {points:"0,-2.1 6.4,-2.1 3.2,2.1", fill:a, stroke:a, transform:"translate(" + (b - 11) + ",0)"}));
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:b, height:c});
  };
  b.resize = function() {
    var a = this.textElement.getComputedTextLength() + 18;
    this._noArrow ? a -= 14 : this._arrow.attr({transform:"translate(" + (a - 11) + ",0)"});
    this._header.attr({width:a});
    this.box.set({width:a});
    this._block.view.alignContent();
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    for (var b = this._contents.options, b = this._contents.options, c = 0, e = b.length;c < e;c++) {
      var f = b[c], g = f[0], f = f[1], h = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), k = Entry.Dom("span", {class:"left", parent:h});
      Entry.Dom("span", {class:"right", parent:h}).text(g);
      this.getValue() == f && k.text("\u2713");
      (function(b, d) {
        b.bind("mousedown touchstart", function(a) {
          a.stopPropagation();
        });
        b.bind("mouseup touchend", function(b) {
          b.stopPropagation();
          a.applyValue(d);
          a.destroyOption();
          a._selectBlockView();
        });
      })(h, f);
    }
    this._position();
  };
  b._position = function() {
    var a = this.getAbsolutePosFromDocument();
    a.y += this.box.height / 2;
    var b = $(document).height(), c = this.optionGroup.height();
    if (b < a.y + c) {
      a.x += this.box.width + 1;
      var b = this.getAbsolutePosFromBoard(), e = this._blockView.getBoard().svgDom.height(), e = e - (e - b.y);
      e - 20 < c && this.optionGroup.height(e - e % 20);
      a.y -= this.optionGroup.height();
    } else {
      a.x += this.box.width / 2 - this.optionGroup.width() / 2;
    }
    this.optionGroup.css({left:a.x, top:a.y});
  };
  b.applyValue = function(a) {
    this.value != a && this.setValue(a);
    this.textElement.textContent = this.getTextByValue(a);
    this.resize();
  };
  b.getTextByValue = function(a) {
    if (!a || "null" === a) {
      return Lang.Blocks.no_target;
    }
    for (var b = this._contents.options, c = 0, e = b.length;c < e;c++) {
      var f = b[c];
      if (f[1] == a) {
        return f[0];
      }
    }
    return Lang.Blocks.no_target;
  };
})(Entry.FieldDropdown.prototype);
Entry.FieldDropdownDynamic = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this._contents = b;
  this._index = d;
  this._arrowColor = b.arrowColor;
  d = this._contents.menuName;
  Entry.Utils.isFunction(d) ? this._menuGenerator = d : this._menuName = d;
  this._CONTENT_HEIGHT = b.dropdownHeight || a.getSkeleton().dropdownHeight || 16;
  this._FONT_SIZE = b.fontSize || a.getSkeleton().fontSize || 12;
  this._ROUND = b.roundValue || 3;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.FieldDropdown, Entry.FieldDropdownDynamic);
(function(b) {
  b.constructor = Entry.FieldDropDownDynamic;
  b._updateValue = function() {
    var a = [];
    Entry.container && (a = this._menuName ? Entry.container.getDropdownList(this._menuName) : this._menuGenerator());
    this._contents.options = a;
    var a = this._contents.options, b = this.getValue();
    b && "null" != b || (b = 0 !== a.length ? a[0][1] : null);
    this.setValue(b);
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent();
    this.optionGroup = Entry.Dom("ul", {class:"entry-widget-dropdown", parent:$("body")});
    this.optionGroup.bind("mousedown touchstart", function(a) {
      a.stopPropagation();
    });
    var b;
    b = this._menuName ? Entry.container.getDropdownList(this._contents.menuName) : this._menuGenerator();
    this._contents.options = b;
    for (var c = 0;c < b.length;c++) {
      var e = b[c], f = e[0], e = e[1], g = Entry.Dom("li", {class:"rect", parent:this.optionGroup}), h = Entry.Dom("span", {class:"left", parent:g});
      Entry.Dom("span", {class:"right", parent:g}).text(f);
      this.getValue() == e && h.text("\u2713");
      (function(b, d) {
        b.mousedown(function(a) {
          a.stopPropagation();
        });
        b.mouseup(function(b) {
          b.stopPropagation();
          a.applyValue(d);
          a.destroyOption();
          a._selectBlockView();
        });
      })(g, e);
    }
    this._position();
  };
})(Entry.FieldDropdownDynamic.prototype);
Entry.FieldImage = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._content = b;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._imgElement = this._path = this.svgGroup = null;
  this._index = d;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldImage);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? this._content.img.replace(".png", "_un.png") : this._content.img;
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:this._imgUrl, x:0, y:-.5 * this._size, width:this._size, height:this._size});
    this.box.set({x:this._size, y:0, width:this._size, height:this._size});
  };
})(Entry.FieldImage.prototype);
Entry.FieldIndicator = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this._size = b.size;
  this._imgUrl = this._block.deletable === Entry.Block.DELETABLE_FALSE_LIGHTEN ? b.img.replace(".png", "_un.png") : b.img;
  this._boxMultiplier = b.boxMultiplier || 2;
  this._highlightColor = b.highlightColor ? b.highlightColor : "#F59900";
  this._position = b.position;
  this._index = d;
  this._imgElement = this._path = this.svgGroup = null;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldIndicator);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && this.svgGroup.remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._imgElement = this.svgGroup.elem("image", {href:Entry.mediaFilePath + this._imgUrl, x:this._position ? -1 * this._size : 0, y:-1 * this._size, width:2 * this._size, height:2 * this._size});
    var a = "m 0,-%s a %s,%s 0 1,1 -0.1,0 z".replace(/%s/gi, this._size);
    this._path = this.svgGroup.elem("path", {d:a, stroke:"none", fill:"none"});
    this.box.set({width:this._size * this._boxMultiplier + (this._position ? -this._size : 0), height:this._size * this._boxMultiplier});
  };
  b.enableHighlight = function() {
    var a = this._path.getTotalLength(), b = this._path;
    this._path.attr({stroke:this._highlightColor, strokeWidth:2, "stroke-linecap":"round", "stroke-dasharray":a + " " + a, "stroke-dashoffset":a});
    setInterval(function() {
      b.attr({"stroke-dashoffset":a}).animate({"stroke-dashoffset":0}, 300);
    }, 1400, mina.easeout);
    setTimeout(function() {
      setInterval(function() {
        b.animate({"stroke-dashoffset":-a}, 300);
      }, 1400, mina.easeout);
    }, 500);
  };
})(Entry.FieldIndicator.prototype);
Entry.Keyboard = {};
Entry.FieldKeyboard = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  this.setValue(String(this.getValue()));
  this._optionVisible = !1;
  this.renderStart(a);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldKeyboard);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g", {class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text").attr({x:4, y:4, "font-size":"9pt"});
    this.textElement.textContent = Entry.getKeyCodeMap()[this.getValue()];
    var a = this.getTextWidth(), b = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {x:0, y:b - 8, width:a, height:16, rx:3, ry:3, fill:"#fff", "fill-opacity":.4});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  b.renderOptions = function() {
    Entry.keyPressed && (this.keyPressed = Entry.keyPressed.attach(this, this._keyboardControl));
    this._optionVisible = !0;
    this._attachDisposeEvent();
    var a = this.getAbsolutePosFromDocument();
    a.x -= this.box.width / 2;
    a.y += this.box.height / 2 + 1;
    this.optionGroup = Entry.Dom("img", {class:"entry-widget-keyboard-input", src:Entry.mediaFilePath + "/media/keyboard_workspace.png", parent:$("body")});
    this.optionGroup.css({left:a.x, top:a.y});
  };
  b.destroyOption = function() {
    this.disposeEvent && (Entry.disposeEvent.detach(this.disposeEvent), delete this.disposeEvent);
    this.optionGroup && (this.optionGroup.remove(), delete this.optionGroup);
    this._optionVisible = !1;
    this.command();
    this.keyPressed && (Entry.keyPressed.detach(this.keyPressed), delete this.keyPressed);
  };
  b._keyboardControl = function(a) {
    a.stopPropagation();
    if (this._optionVisible) {
      a = a.keyCode;
      var b = Entry.getKeyCodeMap()[a];
      void 0 !== b && this.applyValue(b, a);
    }
  };
  b.applyValue = function(a, b) {
    this.setValue(String(b));
    this.destroyOption();
    this.textElement.textContent = a;
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 8;
  };
  b.destroy = function() {
    this.destroyOption();
    Entry.keyPressed && this.keyPressed && Entry.keyPressed.detach(this.keyPressed);
  };
})(Entry.FieldKeyboard.prototype);
Entry.FieldLineBreak = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._index = d;
  this.box = new Entry.BoxModel;
  this.setValue(null);
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldLineBreak);
(function(b) {
  b.renderStart = function() {
  };
  b.align = function(a) {
    var b = this._blockView;
    0 !== b._statements.length && this.box.set({y:(b._statements[a].height || 20) + Math.max(b.contentHeight % 1E3, 30)});
  };
})(Entry.FieldLineBreak.prototype);
Entry.FieldOutput = function(b, a, d, c, e) {
  Entry.Model(this, !1);
  this._blockView = a;
  this._block = a.block;
  this._valueBlock = null;
  this.box = new Entry.BoxModel;
  this.changeEvent = new Entry.Event(this);
  this._index = d;
  this.contentIndex = e;
  this._content = b;
  this.acceptType = b.accept;
  this.view = this;
  this.svgGroup = null;
  this._position = b.position;
  this.box.observe(a, "alignContent", ["width", "height"]);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard(), c);
};
Entry.Utils.inherit(Entry.Field, Entry.FieldOutput);
(function(b) {
  b.schema = {magneting:!1};
  b.renderStart = function(a, b) {
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.view = this;
    this._nextGroup = this.svgGroup;
    this.box.set({x:0, y:0, width:0, height:20});
    var c = this.getValue();
    c && !c.view && (c.setThread(this), c.createView(a, b));
    this._updateValueBlock(c);
    this._blockView.getBoard().constructor == Entry.BlockMenu && this._valueBlock && this._valueBlock.view.removeControl();
  };
  b.align = function(a, b, c) {
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = this._valueBlock;
    f && (b = -.5 * f.view.height);
    f = "translate(" + a + "," + b + ")";
    void 0 === c || c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
    this.box.set({x:a, y:b});
  };
  b.calcWH = function() {
    var a = this._valueBlock;
    a ? (a = a.view, this.box.set({width:a.width, height:a.height})) : this.box.set({width:0, height:20});
  };
  b.calcHeight = b.calcWH;
  b.destroy = function() {
  };
  b._inspectBlock = function() {
  };
  b._setValueBlock = function(a) {
    if (a != this._valueBlock || !this._valueBlock) {
      return this._valueBlock = a, this.setValue(a), a && a.setThread(this), this._valueBlock;
    }
  };
  b._updateValueBlock = function(a) {
    a instanceof Entry.Block || (a = void 0);
    this._sizeObserver && this._sizeObserver.destroy();
    this._posObserver && this._posObserver.destroy();
    (a = this._setValueBlock(a)) ? (a = a.view, a.bindPrev(), this._posObserver = a.observe(this, "_updateValueBlock", ["x", "y"], !1), this._sizeObserver = a.observe(this, "calcWH", ["width", "height"])) : this.calcWH();
    this._blockView.alignContent();
    a = this._blockView.getBoard();
    a.constructor === Entry.Board && a.generateCodeMagnetMap();
  };
  b.getPrevBlock = function(a) {
    return this._valueBlock === a ? this : null;
  };
  b.getNextBlock = function() {
    return null;
  };
  b.requestAbsoluteCoordinate = function(a) {
    a = this._blockView;
    var b = a.contentPos;
    a = a.getAbsoluteCoordinate();
    a.x += this.box.x + b.x;
    a.y += this.box.y + b.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.isGlobal = function() {
    return !1;
  };
  b.separate = function(a) {
    this.getCode().createThread([a]);
    this.changeEvent.notify();
  };
  b.getCode = function() {
    return this._block.thread.getCode();
  };
  b.cut = function(a) {
    return this._valueBlock === a ? (delete this._valueBlock, [a]) : null;
  };
  b._updateBG = function() {
    this.magneting ? this._bg = this.svgGroup.elem("path", {d:"m -4,-12 h 3 l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2 h -3 ", fill:"#fff", stroke:"#fff", "fill-opacity":.7, transform:"translate(0," + (this._valueBlock ? 12 : 0) + ")"}) : this._bg && (this._bg.remove(), delete this._bg);
  };
  b.replace = function(a) {
    var b = this._valueBlock;
    b && (b.view._toGlobalCoordinate(), a.getTerminateOutputBlock().view._contents[1].replace(b));
    this._updateValueBlock(a);
    a.view._toLocalCoordinate(this.svgGroup);
    this.calcWH();
  };
  b.setParent = function(a) {
    this._parent = a;
  };
  b.getParent = function() {
    return this._parent;
  };
  b.getThread = function() {
    return this;
  };
  b.getValueBlock = function() {
    return this._valueBlock;
  };
  b.pointer = function(a) {
    a.unshift(this._index);
    a.unshift(Entry.PARAM);
    return this._block.pointer(a);
  };
})(Entry.FieldOutput.prototype);
Entry.FieldStatement = function(b, a, d) {
  Entry.Model(this, !1);
  this._blockView = a;
  this.block = a.block;
  this.view = this;
  this._index = d;
  this.acceptType = b.accept;
  this._thread = this.statementSvgGroup = this.svgGroup = null;
  this._position = b.position;
  this.observe(a, "alignContent", ["height"], !1);
  this.observe(this, "_updateBG", ["magneting"], !1);
  this.renderStart(a.getBoard());
};
(function(b) {
  b.schema = {x:0, y:0, width:100, height:20, magneting:!1};
  b.magnet = {next:{x:0, y:0}};
  b.renderStart = function(a) {
    this.svgGroup = this._blockView.statementSvgGroup.elem("g");
    this._nextGroup = this.statementSvgGroup = this.svgGroup.elem("g");
    this._initThread(a);
    this._board = a;
  };
  b._initThread = function(a) {
    var b = this.getValue();
    this._thread = b;
    b.createView(a);
    b.view.setParent(this);
    if (a = b.getFirstBlock()) {
      a.view._toLocalCoordinate(this.statementSvgGroup), this.firstBlock = a;
    }
    b.changeEvent.attach(this, this.calcHeight);
    b.changeEvent.attach(this, this.checkTopBlock);
    this.calcHeight();
  };
  b.align = function(a, b, c) {
    c = void 0 === c ? !0 : c;
    var e = this.svgGroup;
    this._position && (this._position.x && (a = this._position.x), this._position.y && (b = this._position.y));
    var f = "translate(" + a + "," + b + ")";
    this.set({x:a, y:b});
    c ? e.animate({transform:f}, 300, mina.easeinout) : e.attr({transform:f});
  };
  b.calcHeight = function() {
    var a = this._thread.view.requestPartHeight(null);
    this.set({height:a});
  };
  b.getValue = function() {
    return this.block.statements[this._index];
  };
  b.requestAbsoluteCoordinate = function() {
    var a = this._blockView.getAbsoluteCoordinate();
    a.x += this.x;
    a.y += this.y;
    return a;
  };
  b.dominate = function() {
    this._blockView.dominate();
  };
  b.destroy = function() {
  };
  b._updateBG = function() {
    if (this._board.dragBlock && this._board.dragBlock.dragInstance) {
      if (this.magneting) {
        var a = this._board.dragBlock.getShadow(), b = this.requestAbsoluteCoordinate(), b = "translate(" + b.x + "," + b.y + ")";
        $(a).attr({transform:b, display:"block"});
        this._clonedShadow = a;
        this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground);
        a = this._board.dragBlock.getBelowHeight();
        this.statementSvgGroup.attr({transform:"translate(0," + a + ")"});
        this.set({height:this.height + a});
      } else {
        this._clonedShadow && (this._clonedShadow.attr({display:"none"}), delete this._clonedShadow), a = this.originalHeight, void 0 !== a && (this.background && (this.background.remove(), this.nextBackground.remove(), delete this.background, delete this.nextBackground), delete this.originalHeight), this.statementSvgGroup.attr({transform:"translate(0,0)"}), this.calcHeight();
      }
      (a = this.block.thread.changeEvent) && a.notify();
    }
  };
  b.insertTopBlock = function(a) {
    this._posObserver && this._posObserver.destroy();
    var b = this.firstBlock;
    (this.firstBlock = a) && a.doInsert(this._thread);
    return b;
  };
  b.getNextBlock = function() {
    return this.firstBlock;
  };
  b.checkTopBlock = function() {
    var a = this._thread.getFirstBlock();
    a && this.firstBlock !== a ? (this.firstBlock = a, a.view.bindPrev(this), a._updatePos()) : a || (this.firstBlock = null);
  };
})(Entry.FieldStatement.prototype);
Entry.FieldText = function(b, a, d) {
  this._block = a.block;
  this._blockView = a;
  this._index = d;
  this.box = new Entry.BoxModel;
  this._fontSize = b.fontSize || a.getSkeleton().fontSize || 12;
  this._color = b.color || this._block.getSchema().fontColor || a.getSkeleton().color || "white";
  this._align = b.align || "left";
  this._text = this.getValue() || b.text;
  this.setValue(null);
  this.textElement = null;
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldText);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this._text = this._text.replace(/(\r\n|\n|\r)/gm, " ");
    this.textElement = this.svgGroup.elem("text").attr({style:"white-space: pre; font-size:" + this._fontSize + "px", "class":"dragNone", fill:this._color});
    this.textElement.textContent = this._text;
    var a = 0, b = this.textElement.getBoundingClientRect();
    "center" == this._align && (a = -b.width / 2);
    this.textElement.attr({x:a, y:.25 * b.height});
    this.box.set({x:0, y:0, width:b.width, height:b.height});
  };
})(Entry.FieldText.prototype);
Entry.FieldTextInput = function(b, a, d) {
  this._blockView = a;
  this._block = a.block;
  this.box = new Entry.BoxModel;
  this.svgGroup = null;
  this.position = b.position;
  this._contents = b;
  this._index = d;
  this.value = this.getValue() || "";
  this.renderStart();
};
Entry.Utils.inherit(Entry.Field, Entry.FieldTextInput);
(function(b) {
  b.renderStart = function() {
    this.svgGroup && $(this.svgGroup).remove();
    this.svgGroup = this._blockView.contentSvgGroup.elem("g");
    this.svgGroup.attr({class:"entry-input-field"});
    this.textElement = this.svgGroup.elem("text", {x:3, y:4, "font-size":"9pt"});
    this.textElement.textContent = this.truncate();
    var a = this.getTextWidth(), b = this.position && this.position.y ? this.position.y : 0;
    this._header = this.svgGroup.elem("rect", {width:a, height:16, y:b - 8, rx:3, ry:3, fill:"transparent"});
    this.svgGroup.appendChild(this.textElement);
    this._bindRenderOptions();
    this.box.set({x:0, y:0, width:a, height:16});
  };
  b.renderOptions = function() {
    var a = this;
    this._attachDisposeEvent(function() {
      a.applyValue();
      a.destroyOption();
    });
    this.optionGroup = Entry.Dom("input", {class:"entry-widget-input-field", parent:$("body")});
    this.optionGroup.val(this.getValue());
    this.optionGroup.on("mousedown", function(a) {
      a.stopPropagation();
    });
    this.optionGroup.on("keyup", function(b) {
      var d = b.keyCode || b.which;
      a.applyValue(b);
      -1 < [13, 27].indexOf(d) && a.destroyOption();
    });
    var b = this.getAbsolutePosFromDocument();
    b.y -= this.box.height / 2;
    this.optionGroup.css({height:16, left:b.x, top:b.y, width:a.box.width});
    this.optionGroup.focus();
    this.optionGroup.select();
  };
  b.applyValue = function(a) {
    a = this.optionGroup.val();
    this.setValue(a);
    this.textElement.textContent = this.truncate();
    this.resize();
  };
  b.resize = function() {
    var a = this.getTextWidth();
    this._header.attr({width:a});
    this.optionGroup.css({width:a});
    this.box.set({width:a});
    this._blockView.alignContent();
  };
  b.getTextWidth = function() {
    return this.textElement.getComputedTextLength() + 6 + 2;
  };
})(Entry.FieldTextInput.prototype);
Entry.GlobalSvg = {};
(function(b) {
  b.DONE = 0;
  b._inited = !1;
  b.REMOVE = 1;
  b.RETURN = 2;
  b.createDom = function() {
    if (!this.inited) {
      $("#globalSvgSurface").remove();
      $("#globalSvg").remove();
      var a = $("body");
      this._container = Entry.Dom("div", {classes:["globalSvgSurface", "entryRemove"], id:"globalSvgSurface", parent:a});
      this.svgDom = Entry.Dom($('<svg id="globalSvg" width="10" height="10"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:a});
      this.svg = Entry.SVG("globalSvg");
      this.top = this.left = 0;
      this._inited = !0;
    }
  };
  b.setView = function(a, b) {
    if (a != this._view && !a.block.isReadOnly() && a.movable) {
      return this._view = a, this._mode = b, b !== Entry.Workspace.MODE_VIMBOARD && a.set({visible:!1}), this.draw(), this.show(), this.align(), this.position(), !0;
    }
  };
  b.draw = function() {
    var a = this._view;
    this._svg && this.remove();
    var b = this._mode == Entry.Workspace.MODE_VIMBOARD;
    this.svgGroup = Entry.SVG.createElement(a.svgGroup.cloneNode(!0), {opacity:1});
    this.svg.appendChild(this.svgGroup);
    b && (a = $(this.svgGroup), a.find("g").css({filter:"none"}), a.find("path").velocity({opacity:0}, {duration:500}), a.find("text").velocity({fill:"#000000"}, {duration:530}));
  };
  b.remove = function() {
    this.svgGroup && (this.svgGroup.remove(), delete this.svgGroup, delete this._view, delete this._offsetX, delete this._offsetY, delete this._startX, delete this._startY, this.hide());
  };
  b.align = function() {
    var a = this._view.getSkeleton().box(this._view).offsetX || 0, b = this._view.getSkeleton().box(this._view).offsetY || 0, a = -1 * a + 1, b = -1 * b + 1;
    this._offsetX = a;
    this._offsetY = b;
    this.svgGroup.attr({transform:"translate(" + a + "," + b + ")"});
  };
  b.show = function() {
    this._container.removeClass("entryRemove");
    this.svgDom.css("display", "block");
  };
  b.hide = function() {
    this._container.addClass("entryRemove");
    this.svgDom.css("display", "none");
  };
  b.position = function() {
    var a = this._view, b = a.getAbsoluteCoordinate(), a = a.getBoard().offset();
    this.left = b.x + a.left - this._offsetX;
    this.top = b.y + a.top - this._offsetY;
    b = this.svgDom[0];
    b.style.left = this.left + "px";
    b.style.top = this.top + "px";
  };
  b.terminateDrag = function(a) {
    var b = Entry.mouseCoordinate;
    a = a.getBoard();
    var c = a.workspace.blockMenu, e = c.offset().left, f = c.offset().top, g = c.visible ? c.svgDom.width() : 0;
    return b.y > a.offset().top - 20 && b.x > e + g ? this.DONE : b.y > f && b.x > e && c.visible ? this.REMOVE : this.RETURN;
  };
  b.addControl = function(a) {
    this.onMouseDown.apply(this, arguments);
  };
  b.onMouseDown = function(a) {
    function b(a) {
      var d = a.pageX;
      a = a.pageY;
      var c = e.left + (d - e._startX), f = e.top + (a - e._startY);
      e.svgDom.css({left:c, top:f});
      e._startX = d;
      e._startY = a;
      e.left = c;
      e.top = f;
    }
    function c(a) {
      $(document).unbind(".block");
    }
    this._startY = a.pageY;
    var e = this;
    a.stopPropagation();
    a.preventDefault();
    var f = $(document);
    f.bind("mousemove.block", b);
    f.bind("mouseup.block", c);
    f.bind("touchmove.block", b);
    f.bind("touchend.block", c);
    this._startX = a.pageX;
    this._startY = a.pageY;
  };
})(Entry.GlobalSvg);
Entry.Mutator = function() {
};
(function(b) {
  b.mutate = function(a, b) {
    var c = Entry.block[a];
    void 0 === c.changeEvent && (c.changeEvent = new Entry.Event);
    c.template = b.template;
    c.params = b.params;
    c.changeEvent.notify(1);
  };
})(Entry.Mutator);
(function(b) {
})(Entry.Mutator.prototype);
Entry.RenderView = function(b, a) {
  this._align = a || "CENTER";
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.view = b;
  this.viewOnly = !0;
  this.suffix = "renderView";
  this.disableMouseEvent = this.visible = !0;
  this._svgId = "renderView_" + (new Date).getTime();
  this._generateView();
  this.offset = this.svgDom.offset();
  this.setWidth();
  this.svg = Entry.SVG(this._svgId);
  Entry.Utils.addFilters(this.svg, this.suffix);
  this.svg && (this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
};
(function(b) {
  b.schema = {code:null, dragBlock:null, closeBlock:null, selectedBlockView:null};
  b._generateView = function() {
    this.renderViewContainer = Entry.Dom("div", {"class":"renderViewContainer", parent:this.view});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="renderView" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.renderViewContainer});
  };
  b.changeCode = function(a) {
    if (!(a instanceof Entry.Code)) {
      return console.error("You must inject code instance");
    }
    this.code = a;
    this.svg || (this.svg = Entry.SVG(this._svgId), this.svgGroup = this.svg.elem("g"), this.svgThreadGroup = this.svgGroup.elem("g"), this.svgThreadGroup.board = this, this.svgBlockGroup = this.svgGroup.elem("g"), this.svgBlockGroup.board = this);
    a.createView(this);
    this.align();
    this.resize();
  };
  b.align = function() {
    var a = this.code.getThreads();
    if (a && 0 !== a.length) {
      for (var b = 0, c = "LEFT" == this._align ? 20 : this.svgDom.width() / 2, e = 0, f = a.length;e < f;e++) {
        var g = a[e].getFirstBlock().view;
        g._moveTo(c, b - g.offsetY, !1);
        g = g.svgGroup.getBBox().height;
        b += g + 15;
      }
      this._bBox = this.svgGroup.getBBox();
      this.height = this._bBox.height;
    }
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.setWidth = function() {
    this._svgWidth = this.svgDom.width();
    this.offset = this.svgDom.offset();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.resize = function() {
    this.svg && this._bBox && $(this.svg).css("height", this._bBox.height + 10);
  };
})(Entry.RenderView.prototype);
Entry.Scroller = function(b, a, d) {
  this._horizontal = void 0 === a ? !0 : a;
  this._vertical = void 0 === d ? !0 : d;
  this.board = b;
  this.svgGroup = null;
  this.vRatio = this.vY = this.vWidth = this.hRatio = this.hX = this.hWidth = 0;
  this._visible = !0;
  this._opacity = -1;
  this.createScrollBar();
  this.setOpacity(0);
  this._bindEvent();
};
Entry.Scroller.RADIUS = 7;
(function(b) {
  b.createScrollBar = function() {
    var a = Entry.Scroller.RADIUS, b = this;
    this.svgGroup = this.board.svg.elem("g").attr({class:"boardScrollbar"});
    this._horizontal && (this.hScrollbar = this.svgGroup.elem("rect", {height:2 * a, rx:a, ry:a}), this.hScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var c = b.dragInstance;
        b.scroll((a.pageX - c.offsetX) / b.hRatio, 0);
        c.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
    this._vertical && (this.vScrollbar = this.svgGroup.elem("rect", {width:2 * a, rx:a, ry:a}), this.vScrollbar.mousedown = function(a) {
      function e(a) {
        a.stopPropagation();
        a.preventDefault();
        a.originalEvent.touches && (a = a.originalEvent.touches[0]);
        var c = b.dragInstance;
        b.scroll(0, (a.pageY - c.offsetY) / b.vRatio);
        c.set({offsetX:a.pageX, offsetY:a.pageY});
      }
      function f(a) {
        $(document).unbind(".scroll");
        delete b.dragInstance;
      }
      if (0 === a.button || a instanceof Touch) {
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var g = $(document);
        g.bind("mousemove.scroll", e);
        g.bind("mouseup.scroll", f);
        g.bind("touchmove.scroll", e);
        g.bind("touchend.scroll", f);
        b.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      }
      a.stopPropagation();
    });
  };
  b.updateScrollBar = function(a, b) {
    this._horizontal && (this.hX += a * this.hRatio, this.hScrollbar.attr({x:this.hX}));
    this._vertical && (this.vY += b * this.vRatio, this.vScrollbar.attr({y:this.vY}));
  };
  b.scroll = function(a, b) {
    if (this.board.code) {
      var c = this.board.svgBlockGroup.getBoundingClientRect(), e = this.board.svgDom, f = c.left - this.board.offset().left, g = c.top - this.board.offset().top, h = c.height;
      a = Math.max(-c.width + Entry.BOARD_PADDING - f, a);
      b = Math.max(-h + Entry.BOARD_PADDING - g, b);
      a = Math.min(e.width() - Entry.BOARD_PADDING - f, a);
      b = Math.min(e.height() - Entry.BOARD_PADDING - g, b);
      Entry.do("scrollBoard", a, b).isPass();
    }
  };
  b._scroll = function(a, b) {
    this.board.code.moveBy(a, b);
    this.updateScrollBar(a, b);
  };
  b.setVisible = function(a) {
    a != this.isVisible() && (this._visible = a, this.svgGroup.attr({display:!0 === a ? "block" : "none"}));
  };
  b.isVisible = function() {
    return this._visible;
  };
  b.setOpacity = function(a) {
    this._opacity != a && (this.hScrollbar.attr({opacity:a}), this.vScrollbar.attr({opacity:a}), this._opacity = a);
  };
  b.resizeScrollBar = function() {
    if (this._visible) {
      var a = this.board, b = a.svgBlockGroup.getBoundingClientRect(), c = a.svgDom, e = c.width(), c = c.height(), f = b.left - a.offset().left, a = b.top - a.offset().top, g = b.width, b = b.height;
      if (this._horizontal) {
        var h = -g + Entry.BOARD_PADDING, k = e - Entry.BOARD_PADDING, g = (e + 2 * Entry.Scroller.RADIUS) * g / (k - h + g);
        isNaN(g) && (g = 0);
        this.hX = (f - h) / (k - h) * (e - g - 2 * Entry.Scroller.RADIUS);
        this.hScrollbar.attr({width:g, x:this.hX, y:c - 2 * Entry.Scroller.RADIUS});
        this.hRatio = (e - g - 2 * Entry.Scroller.RADIUS) / (k - h);
      }
      this._vertical && (f = -b + Entry.BOARD_PADDING, g = c - Entry.BOARD_PADDING, b = (c + 2 * Entry.Scroller.RADIUS) * b / (g - f + b), this.vY = (a - f) / (g - f) * (c - b - 2 * Entry.Scroller.RADIUS), this.vScrollbar.attr({height:b, y:this.vY, x:e - 2 * Entry.Scroller.RADIUS}), this.vRatio = (c - b - 2 * Entry.Scroller.RADIUS) / (g - f));
    }
  };
  b._bindEvent = function() {
    var a = _.debounce(this.resizeScrollBar, 200);
    this.board.changeEvent.attach(this, a);
    Entry.windowResized && Entry.windowResized.attach(this, a);
  };
})(Entry.Scroller.prototype);
Entry.Board = function(b) {
  Entry.Model(this, !1);
  this.changeEvent = new Entry.Event(this);
  this.createView(b);
  this.updateOffset();
  this.scroller = new Entry.Scroller(this, !0, !0);
  this._magnetMap = {};
  Entry.ANIMATION_DURATION = 200;
  Entry.BOARD_PADDING = 100;
  this._initContextOptions();
  Entry.Utils.disableContextmenu(this.svgDom);
  this._addControl();
  this._bindEvent();
};
Entry.Board.OPTION_PASTE = 0;
Entry.Board.OPTION_ALIGN = 1;
Entry.Board.OPTION_CLEAR = 2;
(function(b) {
  b.schema = {code:null, dragBlock:null, magnetedBlockView:null, selectedBlockView:null};
  b.createView = function(a) {
    var b = a.dom, b = "string" === typeof b ? $("#" + b) : $(b);
    if ("DIV" !== b.prop("tagName")) {
      return console.error("Dom is not div element");
    }
    this.view = b;
    this._svgId = "play" + (new Date).getTime();
    this.workspace = a.workspace;
    this._activatedBlockView = null;
    this.wrapper = Entry.Dom("div", {parent:b, class:"entryBoardWrapper"});
    this.svgDom = Entry.Dom($('<svg id="' + this._svgId + '" class="entryBoard" width="100%" height="100%"version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'), {parent:this.wrapper});
    this.visible = !0;
    var c = this;
    this.svg = Entry.SVG(this._svgId);
    $(window).scroll(function() {
      c.updateOffset();
    });
    this.svgGroup = this.svg.elem("g");
    this.svgThreadGroup = this.svgGroup.elem("g");
    this.svgThreadGroup.board = this;
    this.svgBlockGroup = this.svgGroup.elem("g");
    this.svgBlockGroup.board = this;
    a.isOverlay ? (this.wrapper.addClass("entryOverlayBoard"), this.generateButtons(), this.suffix = "overlayBoard") : this.suffix = "board";
    Entry.Utils.addFilters(this.svg, this.suffix);
    this.patternRect = Entry.Utils.addBlockPattern(this.svg, this.suffix);
  };
  b.changeCode = function(a) {
    this.code && this.codeListener && this.code.changeEvent.detach(this.codeListener);
    this.set({code:a});
    var b = this;
    a && (this.codeListener = this.code.changeEvent.attach(this, function() {
      b.changeEvent.notify();
    }), a.createView(this));
    this.scroller.resizeScrollBar();
  };
  b.bindCodeView = function(a) {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
    this.svgBlockGroup = a.svgBlockGroup;
    this.svgThreadGroup = a.svgThreadGroup;
    this.svgGroup.appendChild(this.svgThreadGroup);
    this.svgGroup.appendChild(this.svgBlockGroup);
  };
  b.setMagnetedBlock = function(a, b) {
    if (this.magnetedBlockView) {
      if (this.magnetedBlockView === a) {
        return;
      }
      this.magnetedBlockView.set({magneting:!1});
    }
    this.set({magnetedBlockView:a});
    a && (a.set({magneting:b}), a.dominate());
  };
  b.getCode = function() {
    return this.code;
  };
  b.findById = function(a) {
    return this.code.findById(a);
  };
  b._addControl = function() {
    var a = this.svgDom, b = this;
    a.mousedown(function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.bind("touchstart", function() {
      b.onMouseDown.apply(b, arguments);
    });
    a.on("wheel", function() {
      b.mouseWheel.apply(b, arguments);
    });
    var c = b.scroller;
    c && (a.mouseenter(function(a) {
      c.setOpacity(1);
    }), a.mouseleave(function(a) {
      c.setOpacity(0);
    }));
  };
  b.onMouseDown = function(a) {
    function b(a) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
      var d = f.dragInstance;
      f.scroller.scroll(a.pageX - d.offsetX, a.pageY - d.offsetY);
      d.set({offsetX:a.pageX, offsetY:a.pageY});
    }
    function c(a) {
      $(document).unbind(".entryBoard");
      delete f.dragInstance;
    }
    if (this.workspace.getMode() != Entry.Workspace.MODE_VIMBOARD) {
      a.stopPropagation && a.stopPropagation();
      a.preventDefault && a.preventDefault();
      if (0 === a.button || a.originalEvent && a.originalEvent.touches) {
        a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a;
        Entry.documentMousedown && Entry.documentMousedown.notify(a);
        var e = $(document);
        e.bind("mousemove.entryBoard", b);
        e.bind("mouseup.entryBoard", c);
        e.bind("touchmove.entryBoard", b);
        e.bind("touchend.entryBoard", c);
        this.dragInstance = new Entry.DragInstance({startX:a.pageX, startY:a.pageY, offsetX:a.pageX, offsetY:a.pageY});
      } else {
        if (Entry.Utils.isRightButton(a)) {
          if (!this.visible) {
            return;
          }
          a = [];
          this._contextOptions[Entry.Board.OPTION_PASTE].option.enable = !!Entry.clipboard;
          for (e = 0;e < this._contextOptions.length;e++) {
            this._contextOptions[e].activated && a.push(this._contextOptions[e].option);
          }
          Entry.ContextMenu.show(a);
        }
      }
      var f = this;
    }
  };
  b.mouseWheel = function(a) {
    a = a.originalEvent;
    a.preventDefault();
    var b = Entry.disposeEvent;
    b && b.notify(a);
    this.scroller.scroll(a.wheelDeltaX || -a.deltaX, a.wheelDeltaY || -a.deltaY);
  };
  b.setSelectedBlock = function(a) {
    var b = this.selectedBlockView;
    b && b.removeSelected();
    a instanceof Entry.BlockView ? a.addSelected() : a = null;
    this.set({selectedBlockView:a});
  };
  b._keyboardControl = function(a) {
    var b = this.selectedBlockView;
    b && 46 == a.keyCode && b.block && (Entry.do("destroyBlock", b.block), this.set({selectedBlockView:null}));
  };
  b.hide = function() {
    this.wrapper.addClass("entryRemove");
    this.visible = !1;
  };
  b.show = function() {
    this.wrapper.removeClass("entryRemove");
    this.visible = !0;
  };
  b.alignThreads = function() {
    for (var a = this.svgDom.height(), b = this.code.getThreads(), c = 15, e = 0, a = a - 30, f = 50, g = 0;g < b.length;g++) {
      var h = b[g].getFirstBlock();
      if (h) {
        var h = h.view, k = h.svgGroup.getBBox(), l = c + 15;
        l > a && (f = f + e + 10, e = 0, c = 15);
        e = Math.max(e, k.width);
        l = c + 15;
        h._moveTo(f, l, !1);
        c = c + k.height + 15;
      }
    }
    this.scroller.resizeScrollBar();
  };
  b.clear = function() {
    this.svgBlockGroup.remove();
    this.svgThreadGroup.remove();
  };
  b.updateOffset = function() {
    this._offset = this.svg.getBoundingClientRect();
    var a = $(window), b = a.scrollTop(), a = a.scrollLeft(), c = this._offset;
    this.relativeOffset = {top:c.top - b, left:c.left - a};
    this.btnWrapper && this.btnWrapper.attr({transform:"translate(" + (c.width / 2 - 65) + "," + (c.height - 200) + ")"});
  };
  b.generateButtons = function() {
    var a = this, b = this.svgGroup.elem("g");
    this.btnWrapper = b;
    var c = b.elem("text", {x:27, y:33, class:"entryFunctionButtonText"});
    c.textContent = Lang.Buttons.save;
    var e = b.elem("text", {x:102.5, y:33, class:"entryFunctionButtonText"});
    e.textContent = Lang.Buttons.cancel;
    var f = b.elem("circle", {cx:27.5, cy:27.5, r:27.5, class:"entryFunctionButton"}), b = b.elem("circle", {cx:102.5, cy:27.5, r:27.5, class:"entryFunctionButton"});
    f.onclick = function(b) {
      a.save();
    };
    c.onclick = function(b) {
      a.save();
    };
    b.onclick = function(b) {
      a.cancelEdit();
    };
    e.onclick = function(b) {
      a.cancelEdit();
    };
  };
  b.cancelEdit = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "cancelEdit");
  };
  b.save = function() {
    this.workspace.setMode(Entry.Workspace.MODE_BOARD, "save");
  };
  b.generateCodeMagnetMap = function() {
    var a = this.code;
    if (a && this.dragBlock) {
      for (var b in this.dragBlock.magnet) {
        var c = this._getCodeBlocks(a, b);
        c.sort(function(a, b) {
          return a.point - b.point;
        });
        c.unshift({point:-Number.MAX_VALUE, blocks:[]});
        for (var e = 1;e < c.length;e++) {
          var f = c[e], g = f, h = f.startBlock;
          if (h) {
            for (var k = f.endPoint, l = e;k > g.point && (g.blocks.push(h), l++, g = c[l], g);) {
            }
            delete f.startBlock;
          }
          f.endPoint = Number.MAX_VALUE;
          c[e - 1].endPoint = f.point;
        }
        this._magnetMap[b] = c;
      }
    }
  };
  b._getCodeBlocks = function(a, b) {
    var c = a.getThreads(), e = [], f;
    switch(b) {
      case "previous":
        f = this._getNextMagnets;
        break;
      case "next":
        f = this._getPreviousMagnets;
        break;
      case "string":
        f = this._getFieldMagnets;
        break;
      case "boolean":
        f = this._getFieldMagnets;
        break;
      case "param":
        f = this._getOutputMagnets;
        break;
      default:
        return [];
    }
    for (var g = 0;g < c.length;g++) {
      var h = c[g], e = e.concat(f.call(this, h, h.view.zIndex, null, b))
    }
    return e;
  };
  b._getNextMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      m.zIndex = b;
      if (m.dragInstance) {
        break;
      }
      c += m.y;
      k += m.x;
      a = c + 1;
      m.magnet.next && (a += m.height, h.push({point:c, endPoint:a, startBlock:n, blocks:[]}), h.push({point:a, blocks:[]}), m.absX = k);
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q];
        r.zIndex = b;
        r.absX = k + r.x;
        h.push({point:r.y + c - 30, endPoint:r.y + c, startBlock:r, blocks:[]});
        h.push({point:r.y + c + r.height, blocks:[]});
        b += .01;
        g = g.concat(this._getNextMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      m.magnet.next && (c += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getPreviousMagnets = function(a, b, c, e) {
    var f = a.getBlocks();
    a = [];
    c || (c = {x:0, y:0});
    e = c.x;
    c = c.y;
    var f = f[0], g = f.view;
    g.zIndex = b;
    if (g.dragInstance) {
      return [];
    }
    c += g.y - 15;
    e += g.x;
    return g.magnet.previous ? (b = c + 1 + g.height, a.push({point:c, endPoint:b, startBlock:f, blocks:[]}), a.push({point:b, blocks:[]}), g.absX = e, a) : [];
  };
  b._getFieldMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      if (m.dragInstance) {
        break;
      }
      m.zIndex = b;
      c += m.y;
      k += m.x;
      h = h.concat(this._getFieldBlockMetaData(m, k, c, b, e));
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q], g = g.concat(this._getFieldMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      m.magnet.next && (c += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getFieldBlockMetaData = function(a, b, c, e, f) {
    var g = a._contents, h = [];
    c += a.contentPos.y;
    for (var k = 0;k < g.length;k++) {
      var l = g[k];
      if (l instanceof Entry.FieldBlock) {
        var n = l._valueBlock;
        if (!n.view.dragInstance && (l.acceptType === f || "boolean" === l.acceptType)) {
          var m = b + l.box.x, q = c + l.box.y + a.contentHeight % 1E3 * -.5, r = c + l.box.y + l.box.height;
          l.acceptType === f && (h.push({point:q, endPoint:r, startBlock:n, blocks:[]}), h.push({point:r, blocks:[]}));
          l = n.view;
          l.absX = m;
          l.zIndex = e;
          h = h.concat(this._getFieldBlockMetaData(l, m + l.contentPos.x, q + l.contentPos.y, e + .01, f));
        }
      }
    }
    return h;
  };
  b._getOutputMagnets = function(a, b, c, e) {
    var f = a.getBlocks(), g = [], h = [];
    c || (c = {x:0, y:0});
    var k = c.x;
    c = c.y;
    for (var l = 0;l < f.length;l++) {
      var n = f[l], m = n.view;
      if (m.dragInstance) {
        break;
      }
      m.zIndex = b;
      c += m.y;
      k += m.x;
      h = h.concat(this._getOutputMetaData(m, k, c, b, e));
      n.statements && (b += .01);
      for (var q = 0;q < n.statements.length;q++) {
        a = n.statements[q];
        var r = n.view._statements[q], g = g.concat(this._getOutputMagnets(a, b, {x:r.x + k, y:r.y + c}, e));
      }
      m.magnet.next && (c += m.magnet.next.y, k += m.magnet.next.x);
    }
    return g.concat(h);
  };
  b._getOutputMetaData = function(a, b, c, e, f) {
    var g = a._contents, h = [];
    b += a.contentPos.x;
    c += a.contentPos.y;
    for (a = 0;a < g.length;a++) {
      var k = g[a], l = b + k.box.x, n = c - 24, m = c;
      k instanceof Entry.FieldBlock ? (k.acceptType === f && (h.push({point:n, endPoint:m, startBlock:k, blocks:[]}), h.push({point:m, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20), (n = k._valueBlock) && (h = h.concat(this._getOutputMetaData(n.view, l, c + k.box.y, e + .01, f)))) : k instanceof Entry.FieldOutput && k.acceptType === f && (h.push({point:n, endPoint:m, startBlock:k, blocks:[]}), h.push({point:m, blocks:[]}), k.absX = l, k.zIndex = e, k.width = 20, (n = k._valueBlock) && (n.view.dragInstance || 
      (h = h.concat(this._getOutputMetaData(n.view, b + k.box.x, c + k.box.y, e + .01, f)))));
    }
    return h;
  };
  b.getNearestMagnet = function(a, b, c) {
    var e = this._magnetMap[c];
    if (e && 0 !== e.length) {
      var f = 0, g = e.length - 1, h, k = null, l = "previous" === c ? b - 15 : b;
      for (b = -1 < ["previous", "next"].indexOf(c) ? 20 : 0;f <= g;) {
        if (h = (f + g) / 2 | 0, c = e[h], l < c.point) {
          g = h - 1;
        } else {
          if (l > c.endPoint) {
            f = h + 1;
          } else {
            e = c.blocks;
            for (f = 0;f < e.length;f++) {
              if (g = e[f].view, g.absX - b < a && a < g.absX + g.width && (g = c.blocks[f], !k || k.view.zIndex < g.view.zIndex)) {
                k = c.blocks[f];
              }
            }
            return k;
          }
        }
      }
      return null;
    }
  };
  b.dominate = function(a) {
    a && (a = a.getFirstBlock()) && (this.svgBlockGroup.appendChild(a.view.svgGroup), this.code.dominate(a.thread));
  };
  b.setPatternRectFill = function(a) {
    this.patternRect.attr({fill:a});
  };
  b._removeActivated = function() {
    this._activatedBlockView && (this._activatedBlockView.removeActivated(), this._activatedBlockView = null);
  };
  b.activateBlock = function(a) {
    a = a.view;
    var b = a.getAbsoluteCoordinate(), c = this.svgDom, e = b.x, b = b.y, e = c.width() / 2 - e, c = c.height() / 2 - b - 100;
    this.scroller.scroll(e, c);
    a.addActivated();
    this._activatedBlockView = a;
  };
  b.reDraw = function() {
    this.code.view.reDraw();
  };
  b.separate = function(a, b) {
    "string" === typeof a && (a = this.findById(a));
    a.view && a.view._toGlobalCoordinate();
    var c = a.getPrevBlock();
    a.separate(b);
    c && c.getNextBlock() && c.getNextBlock().view.bindPrev();
  };
  b.insert = function(a, b, c) {
    "string" === typeof a && (a = this.findById(a));
    this.separate(a, c);
    3 === b.length ? a.moveTo(b[0], b[1]) : 4 === b.length && 0 === b[3] ? (b = this.code.getThreads()[b[2]], a.thread.cut(a), b.insertToTop(a), a.getNextBlock().view.bindPrev()) : (b = b instanceof Array ? this.code.getTargetByPointer(b) : b, b instanceof Entry.Block ? ("basic" === a.getBlockType() && a.view.bindPrev(b), a.doInsert(b)) : b instanceof Entry.FieldStatement ? (a.view.bindPrev(b), b.insertTopBlock(a)) : a.doInsert(b));
  };
  b.adjustThreadsPosition = function() {
  };
  b._initContextOptions = function() {
    var a = this;
    this._contextOptions = [{activated:!0, option:{text:"\ubd99\uc5ec\ub123\uae30", enable:!!Entry.clipboard, callback:function() {
      Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }}}, {activated:!0, option:{text:"\ube14\ub85d \uc815\ub9ac\ud558\uae30", callback:function() {
      a.alignThreads();
    }}}, {activated:!0, option:{text:"\ubaa8\ub4e0 \ucf54\ub4dc \uc0ad\uc81c\ud558\uae30", callback:function() {
      a.code.clear();
    }}}];
  };
  b.activateContextOption = function(a) {
    this._contextOptions[a].activated = !0;
  };
  b.deActivateContextOption = function(a) {
    this._contextOptions[a].activated = !1;
  };
  b._bindEvent = function() {
    Entry.documentMousedown && (Entry.documentMousedown.attach(this, this.setSelectedBlock), Entry.documentMousedown.attach(this, this._removeActivated));
    Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
    if (Entry.windowResized) {
      var a = _.debounce(this.updateOffset, 200);
      Entry.windowResized.attach(this, a);
    }
  };
  b.offset = function() {
    (!this._offset || 0 === this._offset.top && 0 === this._offset.left) && this.updateOffset();
    return this._offset;
  };
})(Entry.Board.prototype);
Entry.skeleton = function() {
};
Entry.skeleton.basic = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_create = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh h -%w l -8,8 -8,-8 v -%wh z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, box:function(b) {
  return {offsetX:-8, offsetY:0, width:(b ? b.contentWidth : 150) + 30, height:Math.max(30, (b ? b.contentHeight : 28) + 2), marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 30) : 30) + 1 + b.offsetY}};
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_event = {path:function(b) {
  b = b.contentWidth;
  b = Math.max(0, b);
  return "m -8,0 m 0,-5 a 19.5,19.5 0, 0,1 16,0 c 10,5 15,5 20,5 h %w a 15,15 0 0,1 0,30 H 8 l -8,8 -8,-8 l 0,0.5 a 19.5,19.5 0, 0,1 0,-35 z".replace(/%w/gi, b - 30);
}, box:function(b) {
  return {offsetX:-19, offsetY:-7, width:b.contentWidth + 30, height:30, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height + b.offsetY + 7, 30) : 30) + 1}};
}, contentPos:function(b) {
  return {x:1, y:15};
}};
Entry.skeleton.basic_loop = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight, d = Math.max(30, d + 2), a = Math.max(0, a + 9 - d / 2);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh/gi, d).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h/gi, d / 2).replace(/%sh/gi, b + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 30), d = b._statements[0] ? b._statements[0].height : 20, d = Math.max(d, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:d + a + 18 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(b.contentHeight + 2, 30);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:d + b + 17, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight, 28) / 2 + 1};
}};
Entry.skeleton.basic_define = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight, d = Math.max(30, d + 2), a = Math.max(0, a + 9 - d / 2);
  b = b._statements[0] ? b._statements[0].height : 30;
  b = Math.max(b, 20);
  return "m -8,0 l 16,0 h %w a %h,%h 0 0,1 0,%wh H 24 l -8,8 -8,-8 h -0.4 v %sh h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H -8 z".replace(/%wh/gi, d).replace(/%w/gi, a).replace(/%h/gi, d / 2).replace(/%bw/gi, a - 8).replace(/%sh/gi, b + 1);
}, magnets:function() {
  return {};
}, box:function(b) {
  return {offsetX:0, offsetY:0, width:b.contentWidth, height:Math.max(b.contentHeight, 25) + 46, marginBottom:0};
}, statementPos:function(b) {
  return [{x:16, y:Math.max(30, b.contentHeight + 2)}];
}, contentPos:function() {
  return {x:14, y:15};
}};
Entry.skeleton.pebble_event = {path:function(b) {
  return "m 0,0 a 25,25 0 0,1 9,48.3 a 9,9 0 0,1 -18,0 a 25,25 0 0,1 9,-48.3 z";
}, box:function(b) {
  return {offsetX:-25, offsetY:0, width:50, height:48.3, marginBottom:0};
}, magnets:function(b) {
  return {next:{x:0, y:(b ? Math.max(b.height, 49.3) : 49.3) + b.offsetY}};
}, contentPos:function() {
  return {x:0, y:25};
}};
Entry.skeleton.pebble_loop = {fontSize:16, dropdownHeight:23, path:function(b) {
  b = Math.max(b._statements[0] ? b._statements[0].height : 50, 50);
  return "M 0,9 a 9,9 0 0,0 9,-9 h %cw q 25,0 25,25 v %ch q 0,25 -25,25 h -%cw a 9,9 0 0,1 -18,0 h -%cw q -25,0 -25,-25 v -%ch q 0,-25 25,-25 h %cw a 9,9 0 0,0 9,9 M 0,49 a 9,9 0 0,1 -9,-9 h -28 a 25,25 0 0,0 -25,25 v %cih a 25,25 0 0,0 25,25 h 28 a 9,9 0 0,0 18,0 h 28 a 25,25 0 0,0 25,-25 v -%cih a 25,25 0 0,0 -25,-25 h -28 a 9,9 0 0,1 -9,9 z".replace(/%cw/gi, 41).replace(/%ch/gi, b + 4).replace(/%cih/gi, b - 50);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight + 2, 41), d = b._statements[0] ? b._statements[0].height : 20, d = Math.max(d, 51);
  return {previous:{x:0, y:0}, next:{x:0, y:d + a + 13 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(b.contentHeight + 2, 41);
  b = b._statements[0] ? b._statements[0].height : 20;
  b = Math.max(b, 51);
  return {offsetX:-(a / 2 + 13), offsetY:0, width:a + 30, height:d + b + 13, marginBottom:0};
}, statementPos:function(b) {
  return [{x:0, y:Math.max(39, b.contentHeight + 2) + 1.5}];
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.pebble_basic = {fontSize:15, morph:["prev", "next"], path:function(b) {
  return "m 0,9 a 9,9 0 0,0 9,-9 h 28 q 25,0 25,25q 0,25 -25,25h -28 a 9,9 0 0,1 -18,0 h -28 q -25,0 -25,-25q 0,-25 25,-25h 28 a 9,9 0 0,0 9,9 z";
}, magnets:function(b) {
  return {previous:{x:0, y:0}, next:{x:0, y:(b ? Math.max(b.height, 51) : 51) + b.offsetY}};
}, box:function() {
  return {offsetX:-62, offsetY:0, width:124, height:50, marginBottom:0};
}, contentPos:function() {
  return {x:-46, y:25};
}};
Entry.skeleton.basic_string_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 12);
  return "m %h,0 h %w a %h,%h 0 1,1 0,%wh H %h A %h,%h 0 1,1 %h,0 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 12, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {string:{}};
}, contentPos:function(b) {
  return {x:6, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_boolean_field = {path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(18, b + 2);
  a = Math.max(0, a - b + 19);
  return "m %h,0 h %w l %h,%h -%h,%h H %h l -%h,-%h %h,-%h z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, color:"#000", outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 19, height:Math.max((b ? b.contentHeight : 18) + 2, 18), marginBottom:0};
}, magnets:function() {
  return {boolean:{}};
}, contentPos:function(b) {
  return {x:10, y:Math.max(b.contentHeight, 16) / 2 + 1};
}};
Entry.skeleton.basic_param = {path:function(b) {
  var a = b.contentWidth;
  (b = b._contents[b._contents.length - 1]) && (a -= b.box.width + Entry.BlockView.PARAM_SPACE - 2);
  a = Math.max(0, a);
  return "m 4,0 h 10 h %w l 2,2 0,3 3,0 1,1 0,12 -1,1 -3,0 0,3 -2,2h -%w h -10 l -2,-2 0,-3 3,0 1,-1 0,-12 -1,-1 -3,0 0,-3 2,-2".replace(/%w/gi, a);
}, outerLine:"#768dce", box:function(b) {
  return {offsetX:0, offsetY:0, width:(b ? b.contentWidth : 5) + 11, height:24, marginBottom:0};
}, magnets:function() {
  return {param:{}};
}, contentPos:function(b) {
  return {x:11, y:12};
}};
Entry.skeleton.basic_button = {path:function() {
  return "m -64,0 h 128 a 6,6 0, 0,1 6,6 v 18 a 6,6 0, 0,1 -6,6 h -128 a 6,6 0, 0,1 -6,-6 v -18 a 6,6 0, 0,1 6,-6 z";
}, box:function() {
  return {offsetX:-80, offsetY:0, width:140, height:30};
}, contentPos:function() {
  return {x:0, y:15};
}, movable:!1, readOnly:!0, nextShadow:!0, classes:["basicButtonView"]};
Entry.skeleton.basic_without_next = {box:Entry.skeleton.basic.box, contentPos:Entry.skeleton.basic.contentPos, path:function(b) {
  var a = b.contentWidth;
  b = b.contentHeight;
  b = Math.max(30, b + 2);
  a = Math.max(0, a + 9 - b / 2);
  return "m -8,0 l 8,8 8,-8 h %w a %h,%h 0 0,1 0, %wh H -8 z".replace(/%wh/gi, b).replace(/%w/gi, a).replace(/%h/gi, b / 2);
}, magnets:function(b) {
  return {previous:{x:0, y:0}};
}};
Entry.skeleton.basic_double_loop = {path:function(b) {
  var a = b.contentWidth, d = b.contentHeight % 1E3, c = Math.floor(b.contentHeight / 1E3), d = Math.max(30, d + 2), c = Math.max(30, c + 2), a = Math.max(0, a + 5 - d / 2), e = b._statements;
  b = e[0] ? e[0].height : 20;
  e = e[1] ? e[1].height : 20;
  b = Math.max(b, 20);
  e = Math.max(e, 20);
  return "m -8,0 l 8,8 8,-8 h %w a %h1,%h1 0 0,1 0,%wh1 H 24 l -8,8 -8,-8 h -0.4 v %sh1 h 0.4 l 8,8 8,-8 h %bw a %h2,%h2 0 0,1 0,%wh2 H 24 l -8,8 -8,-8 h -0.4 v %sh2 h 0.4 l 8,8 8,-8 h %bw a 8,8 0 0,1 0,16 H 8 l -8,8 -8,-8 z".replace(/%wh1/gi, d).replace(/%wh2/gi, c).replace(/%w/gi, a).replace(/%bw/gi, a - 8).replace(/%h1/gi, d / 2).replace(/%h2/gi, c / 2).replace(/%sh1/gi, b + 1).replace(/%sh2/gi, e + 1);
}, magnets:function(b) {
  var a = Math.max(b.contentHeight % 1E3 + 2, 30), d = Math.max(Math.floor(b.contentHeight / 1E3) + 2, 30), c = b._statements[0] ? b._statements[0].height : 20, e = b._statements[1] ? b._statements[1].height : 20, c = Math.max(c, 20), e = Math.max(e, 20);
  return {previous:{x:0, y:0}, next:{x:0, y:c + e + a + d + 19 + b.offsetY}};
}, box:function(b) {
  var a = b.contentWidth, d = Math.max(Math.floor(b.contentHeight / 1E3) + 2, 30), c = Math.max(b.contentHeight % 1E3 + 2, 30), e = b._statements[0] ? b._statements[0].height % 1E3 : 20;
  b = b._statements[1] ? b._statements[1].height : 20;
  b = Math.floor(b / 1E3);
  e = Math.max(e, 20);
  b = Math.max(b, 20);
  return {offsetX:-8, offsetY:0, width:a + 30, height:d + c + e + b + 17, marginBottom:0};
}, statementPos:function(b) {
  var a = Math.max(30, b.contentHeight % 1E3 + 2) + 1;
  return [{x:16, y:a}, {x:16, y:a + Math.max(b._statements[0] ? b._statements[0].height % 1E3 : 20, 20) + Math.max(Math.floor(b.contentHeight / 1E3) + 2, 30) + 1}];
}, contentPos:function(b) {
  return {x:14, y:Math.max(b.contentHeight % 1E3, 28) / 2 + 1};
}};
Entry.Thread = function(b, a, d) {
  this._data = new Entry.Collection;
  this._code = a;
  this.changeEvent = new Entry.Event(this);
  this.changeEvent.attach(this, this.handleChange);
  this._event = null;
  this.parent = d ? d : a;
  this.load(b);
};
(function(b) {
  b.load = function(a, b) {
    void 0 === a && (a = []);
    if (!(a instanceof Array)) {
      return console.error("thread must be array");
    }
    for (var c = 0;c < a.length;c++) {
      var e = a[c];
      e instanceof Entry.Block || e.isDummy ? (e.setThread(this), this._data.push(e)) : this._data.push(new Entry.Block(e, this));
    }
    (c = this._code.view) && this.createView(c.board, b);
  };
  b.registerEvent = function(a, b) {
    this._event = b;
    this._code.registerEvent(a, b);
  };
  b.unregisterEvent = function(a, b) {
    this._code.unregisterEvent(a, b);
  };
  b.createView = function(a, b) {
    this.view || (this.view = new Entry.ThreadView(this, a));
    this._data.map(function(c) {
      c.createView(a, b);
    });
  };
  b.separate = function(a, b) {
    if (this._data.has(a.id)) {
      var c = this._data.splice(this._data.indexOf(a), b);
      this._code.createThread(c);
      this.changeEvent.notify();
    }
  };
  b.cut = function(a) {
    a = this._data.indexOf(a);
    a = this._data.splice(a);
    this.changeEvent.notify();
    return a;
  };
  b.insertByBlock = function(a, b) {
    for (var c = a ? this._data.indexOf(a) : -1, e = 0;e < b.length;e++) {
      b[e].setThread(this);
    }
    this._data.splice.apply(this._data, [c + 1, 0].concat(b));
    this.changeEvent.notify();
  };
  b.insertToTop = function(a) {
    a.setThread(this);
    this._data.unshift.apply(this._data, [a]);
    this.changeEvent.notify();
  };
  b.clone = function(a, b) {
    a = a || this._code;
    for (var c = new Entry.Thread([], a), e = this._data, f = [], g = 0, h = e.length;g < h;g++) {
      f.push(e[g].clone(c));
    }
    c.load(f, b);
    return c;
  };
  b.toJSON = function(a, b) {
    for (var c = [], e = void 0 === b ? 0 : b;e < this._data.length;e++) {
      this._data[e] instanceof Entry.Block && c.push(this._data[e].toJSON(a));
    }
    return c;
  };
  b.destroy = function(a) {
    this._code.destroyThread(this, !1);
    this.view && this.view.destroy(a);
    for (var b = this._data, c = b.length - 1;0 <= c;c--) {
      b[c].destroy(a);
    }
  };
  b.getBlock = function(a) {
    return this._data[a];
  };
  b.getBlocks = function() {
    return this._data.map(function(a) {
      return a;
    });
  };
  b.countBlock = function() {
    for (var a = 0, b = 0;b < this._data.length;b++) {
      var c = this._data[b];
      if (c.type && (a++, c = c.statements)) {
        for (var e = 0;e < c.length;e++) {
          a += c[e].countBlock();
        }
      }
    }
    return a;
  };
  b.handleChange = function() {
    0 === this._data.length && this.destroy();
  };
  b.getCode = function() {
    return this._code;
  };
  b.setCode = function(a) {
    this._code = a;
  };
  b.spliceBlock = function(a) {
    var b = this._data;
    b.remove(a);
    0 === b.length && this.view.getParent().constructor !== Entry.FieldStatement && this.destroy();
    this.changeEvent.notify();
  };
  b.getFirstBlock = function() {
    return this._data[0];
  };
  b.getPrevBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a - 1);
  };
  b.getNextBlock = function(a) {
    a = this._data.indexOf(a);
    return this._data.at(a + 1);
  };
  b.getLastBlock = function() {
    return this._data.at(this._data.length - 1);
  };
  b.getRootBlock = function() {
    return this._data.at(0);
  };
  b.hasBlockType = function(a) {
    function b(c) {
      if (a == c.type) {
        return !0;
      }
      for (var f = c.params, g = 0;g < f.length;g++) {
        var h = f[g];
        if (h && h.constructor == Entry.Block && b(h)) {
          return !0;
        }
      }
      if (c = c.statements) {
        for (f = 0;f < c.length;f++) {
          if (c[f].hasBlockType(a)) {
            return !0;
          }
        }
      }
      return !1;
    }
    for (var c = 0;c < this._data.length;c++) {
      if (b(this._data[c])) {
        return !0;
      }
    }
    return !1;
  };
  b.getCount = function(a) {
    var b = this._data.length;
    a && (b -= this._data.indexOf(a));
    return b;
  };
  b.indexOf = function(a) {
    return this._data.indexOf(a);
  };
  b.pointer = function(a, b) {
    var c = this.indexOf(b);
    a.unshift(c);
    this.parent instanceof Entry.Block && a.unshift(this.parent.indexOfStatements(this));
    return this._code === this.parent ? (a.unshift(this._code.indexOf(this)), c = this._data[0], a.unshift(c.y), a.unshift(c.x), a) : this.parent.pointer(a);
  };
  b.getBlockList = function(a) {
    for (var b = [], c = 0;c < this._data.length;c++) {
      b = b.concat(this._data[c].getBlockList(a));
    }
    return b;
  };
})(Entry.Thread.prototype);
Entry.Block = function(b, a) {
  var d = this;
  Entry.Model(this, !1);
  this._schema = null;
  this.setThread(a);
  this.load(b);
  var c = this.getCode();
  c.registerBlock(this);
  var e = this.events.dataAdd;
  e && c.object && e.forEach(function(a) {
    Entry.Utils.isFunction(a) && a(d);
  });
};
Entry.Block.MAGNET_RANGE = 10;
Entry.Block.MAGNET_OFFSET = .4;
Entry.Block.DELETABLE_TRUE = 1;
Entry.Block.DELETABLE_FALSE = 2;
Entry.Block.DELETABLE_FALSE_LIGHTEN = 3;
(function(b) {
  b.schema = {id:null, x:0, y:0, type:null, params:[], statements:[], view:null, thread:null, movable:null, deletable:Entry.Block.DELETABLE_TRUE, readOnly:null, copyable:!0, events:{}};
  b.load = function(a) {
    a.id || (a.id = Entry.Utils.generateId());
    this.set(a);
    this.loadSchema();
  };
  b.changeSchema = function(a) {
    this.set({params:[]});
    this.loadSchema();
  };
  b.getSchema = function() {
    this._schema || this.loadSchema();
    return this._schema;
  };
  b.loadSchema = function() {
    if (this._schema = Entry.block[this.type]) {
      !this._schemaChangeEvent && this._schema.changeEvent && (this._schemaChangeEvent = this._schema.changeEvent.attach(this, this.changeSchema));
      var a = this._schema.events;
      if (a) {
        for (var b in a) {
          this.events[b] || (this.events[b] = []);
          for (var c = a[b], e = 0;e < c.length;e++) {
            var f = c[e];
            f && 0 > this.events[b].indexOf(f) && this.events[b].push(f);
          }
        }
      }
      this._schema.event && this.thread.registerEvent(this, this._schema.event);
      a = this.params;
      b = this._schema.params;
      for (e = 0;b && e < b.length;e++) {
        c = void 0 === a[e] || null === a[e] ? b[e].value : a[e], f = a[e] || e < a.length, !c || "Output" !== b[e].type && "Block" !== b[e].type || (c = new Entry.Block(c, this.thread)), f ? a.splice(e, 1, c) : a.push(c);
      }
      if (a = this._schema.statements) {
        for (e = 0;e < a.length;e++) {
          this.statements.splice(e, 1, new Entry.Thread(this.statements[e], this.getCode(), this));
        }
      }
    }
  };
  b.changeType = function(a) {
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    this.set({type:a});
    this.loadSchema();
    this.view && this.view.changeType(a);
  };
  b.setThread = function(a) {
    this.set({thread:a});
  };
  b.getThread = function() {
    return this.thread;
  };
  b.insertAfter = function(a) {
    this.thread.insertByBlock(this, a);
  };
  b._updatePos = function() {
    this.view && this.set({x:this.view.x, y:this.view.y});
  };
  b.moveTo = function(a, b) {
    this.view && this.view._moveTo(a, b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.createView = function(a, b) {
    this.view || (this.set({view:new Entry.BlockView(this, a, b)}), this._updatePos());
  };
  b.clone = function(a) {
    return new Entry.Block(this.toJSON(!0), a);
  };
  b.toJSON = function(a) {
    var b = this._toJSON();
    delete b.view;
    delete b.thread;
    delete b.events;
    a && delete b.id;
    b.params = b.params.map(function(b) {
      b instanceof Entry.Block && (b = b.toJSON(a));
      return b;
    });
    b.statements = b.statements.map(function(b) {
      return b.toJSON(a);
    });
    b.x = this.x;
    b.y = this.y;
    b.movable = this.movable;
    b.deletable = this.deletable;
    b.readOnly = this.readOnly;
    return b;
  };
  b.destroy = function(a, b) {
    var c = this, e = this.params;
    if (e) {
      for (var f = 0;f < e.length;f++) {
        var g = e[f];
        g instanceof Entry.Block && (g.doNotSplice = !0, g.destroy(a));
      }
    }
    if (e = this.statements) {
      for (f = 0;f < e.length;f++) {
        e[f].destroy(a);
      }
    }
    g = this.getPrevBlock();
    f = this.getNextBlock();
    this.getCode().unregisterBlock(this);
    e = this.getThread();
    this._schema.event && e.unregisterEvent(this, this._schema.event);
    f && (b ? f.destroy(a, b) : g ? f.view.bindPrev(g) : (g = this.getThread().view.getParent(), g.constructor === Entry.FieldStatement ? (f.view.bindPrev(g), g.insertTopBlock(f)) : g.constructor === Entry.FieldStatement ? f.replace(g._valueBlock) : f.view._toGlobalCoordinate()));
    this.doNotSplice ? delete this.doNotSplice : e.spliceBlock(this);
    this.view && this.view.destroy(a);
    this._schemaChangeEvent && this._schemaChangeEvent.destroy();
    (f = this.events.dataDestroy) && this.getCode().object && f.forEach(function(a) {
      Entry.Utils.isFunction(a) && a(c);
    });
  };
  b.getView = function() {
    return this.view;
  };
  b.setMovable = function(a) {
    this.movable != a && this.set({movable:a});
  };
  b.setCopyable = function(a) {
    this.copyable != a && this.set({copyable:a});
  };
  b.isMovable = function() {
    return this.movable;
  };
  b.isCopyable = function() {
    return this.copyable;
  };
  b.setDeletable = function(a) {
    this.deletable != a && this.set({deletable:a});
  };
  b.isDeletable = function() {
    return this.deletable === Entry.Block.DELETABLE_TRUE;
  };
  b.isReadOnly = function() {
    return this.readOnly;
  };
  b.getCode = function() {
    return this.thread.getCode();
  };
  b.doAdd = function() {
    this.getCode().changeEvent.notify();
  };
  b.doMove = function() {
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.doSeparate = function() {
    this.separate();
  };
  b.doInsert = function(a) {
    "basic" === this.getBlockType() ? this.insert(a) : this.replace(a);
  };
  b.doDestroy = function(a) {
    this.destroy(a);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.doDestroyBelow = function(a) {
    console.log("destroyBelow", this.id, this.x, this.y);
    this.destroy(a, !0);
    this.getCode().changeEvent.notify();
    return this;
  };
  b.copy = function() {
    var a = this.getThread(), b = [];
    if (a instanceof Entry.Thread) {
      for (var c = a.getBlocks().indexOf(this), a = a.toJSON(!0, c), c = 0;c < a.length;c++) {
        b.push(a[c]);
      }
    } else {
      b.push(this.toJSON(!0));
    }
    a = this.view.getAbsoluteCoordinate();
    c = b[0];
    c.x = a.x + 15;
    c.y = a.y + 15;
    c.id = Entry.Utils.generateId();
    return b;
  };
  b.copyToClipboard = function() {
    Entry.clipboard = this.copy();
  };
  b.separate = function(a) {
    this.thread.separate(this, a);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.insert = function(a) {
    var b = this.thread.cut(this);
    a instanceof Entry.Thread ? a.insertByBlock(null, b) : a.insertAfter(b);
    this._updatePos();
    this.getCode().changeEvent.notify();
  };
  b.replace = function(a) {
    this.thread.cut(this);
    a.getThread().replace(this);
    this.getCode().changeEvent.notify();
  };
  b.getPrevBlock = function() {
    return this.thread.getPrevBlock(this);
  };
  b.getNextBlock = function() {
    return this.thread.getNextBlock(this) || null;
  };
  b.getLastBlock = function() {
    return this.thread.getLastBlock();
  };
  b.getOutputBlock = function() {
    for (var a = this._schema.params, b = 0;a && b < a.length;b++) {
      if ("Output" === a[b].type) {
        return this.params[b];
      }
    }
    return null;
  };
  b.getTerminateOutputBlock = function() {
    for (var a = this;;) {
      var b = a.getOutputBlock();
      if (!b) {
        return a;
      }
      a = b;
    }
  };
  b.getBlockType = function() {
    if (!this.view) {
      return null;
    }
    var a = Entry.skeleton[this._schema.skeleton].magnets(this.view);
    return a.next || a.previous ? "basic" : a.boolean || a.string ? "field" : a.output ? "output" : null;
  };
  b.indexOfStatements = function(a) {
    return this.statements.indexOf(a);
  };
  b.pointer = function(a) {
    a || (a = []);
    return this.thread.pointer(a, this);
  };
  b.targetPointer = function() {
    var a = this.thread.pointer([], this);
    4 === a.length && 0 === a[3] && a.pop();
    return a;
  };
  b.getBlockList = function(a) {
    var b = [];
    if (!this._schema) {
      return [];
    }
    if (a && this._schema.isPrimitive) {
      return b;
    }
    b.push(this);
    for (var c = this.params, e = 0;e < c.length;e++) {
      var f = c[e];
      f && f.constructor == Entry.Block && (b = b.concat(f.getBlockList(a)));
    }
    if (c = this.statements) {
      for (e = 0;e < c.length;e++) {
        b = b.concat(c[e].getBlockList(a));
      }
    }
    return b;
  };
})(Entry.Block.prototype);
Entry.ThreadView = function(b, a) {
  Entry.Model(this, !1);
  this.thread = b;
  this.svgGroup = a.svgThreadGroup.elem("g");
  this.parent = a;
};
(function(b) {
  b.schema = {height:0, zIndex:0};
  b.destroy = function() {
    this.svgGroup.remove();
  };
  b.setParent = function(a) {
    this.parent = a;
  };
  b.getParent = function() {
    return this.parent;
  };
  b.renderText = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderText();
    }
  };
  b.renderBlock = function() {
    for (var a = this.thread.getBlocks(), b = 0;b < a.length;b++) {
      a[b].view.renderBlock();
    }
  };
  b.requestAbsoluteCoordinate = function(a) {
    var b = this.thread.getBlocks(), c = b.shift(), e = {x:0, y:0};
    for (this.parent instanceof Entry.Board || this.parent instanceof Entry.BlockMenu || (e = this.parent.requestAbsoluteCoordinate());c && c.view !== a && c.view;) {
      c = c.view, e.x += c.x + c.magnet.next.x, e.y += c.y + c.magnet.next.y, c = b.shift();
    }
    return e;
  };
  b.requestPartHeight = function(a, b) {
    for (var c = this.thread.getBlocks(), e = c.pop(), f = a ? a.magnet.next ? a.magnet.next.y : a.height : 0;e && e.view !== a && e.view;) {
      e = e.view, f = e.magnet.next ? f + e.magnet.next.y : f + e.height, e.dragMode === Entry.DRAG_MODE_DRAG && (f = 0), e = c.pop();
    }
    return f;
  };
  b.dominate = function() {
    this.parent.dominate(this.thread);
  };
  b.isGlobal = function() {
    return this.parent instanceof Entry.Board;
  };
  b.reDraw = function() {
    for (var a = this.thread._data, b = a.length - 1;0 <= b;b--) {
      a[b].view.reDraw();
    }
  };
  b.setZIndex = function(a) {
    this.set({zIndex:a});
  };
})(Entry.ThreadView.prototype);
Entry.FieldTrashcan = function(b) {
  b && this.setBoard(b);
  this.dragBlockObserver = this.dragBlock = null;
  this.isOver = !1;
  Entry.windowResized && Entry.windowResized.attach(this, this.setPosition);
};
(function(b) {
  b._generateView = function() {
    this.svgGroup = this.board.svg.elem("g");
    this.renderStart();
    this._addControl();
  };
  b.renderStart = function() {
    var a = Entry.mediaFilePath + "delete_";
    this.trashcanTop = this.svgGroup.elem("image", {href:a + "cover.png", width:60, height:20});
    this.svgGroup.elem("image", {href:a + "body.png", y:20, width:60, height:60});
  };
  b._addControl = function() {
    $(this.svgGroup).bind("mousedown", function(a) {
      Entry.Utils.isRightButton(a) && (a.stopPropagation(), $("#entryWorkspaceBoard").css("background", "white"));
    });
  };
  b.updateDragBlock = function() {
    var a = this.board.dragBlock, b = this.dragBlockObserver;
    b && (b.destroy(), this.dragBlockObserver = null);
    a ? this.dragBlockObserver = a.observe(this, "checkBlock", ["x", "y"]) : (this.isOver && this.dragBlock && !this.dragBlock.block.getPrevBlock() && (this.dragBlock.block.doDestroyBelow(!0), createjs.Sound.play("entryDelete")), this.tAnimation(!1));
    this.dragBlock = a;
  };
  b.checkBlock = function() {
    var a = this.dragBlock;
    if (a && a.block.isDeletable()) {
      var b = this.board.offset(), c = this.getPosition(), e = c.x + b.left, b = c.y + b.top, f, g;
      if (a = a.dragInstance) {
        f = a.offsetX, g = a.offsetY;
      }
      this.tAnimation(f >= e && g >= b);
    }
  };
  b.align = function() {
    var a = this.getPosition();
    this.svgGroup.attr({transform:"translate(" + a.x + "," + a.y + ")"});
  };
  b.setPosition = function() {
    if (this.board) {
      var a = this.board.svgDom;
      this._x = a.width() - 110;
      this._y = a.height() - 110;
      this.align();
    }
  };
  b.getPosition = function() {
    return {x:this._x, y:this._y};
  };
  b.tAnimation = function(a) {
    if (a !== this.isOver) {
      a = void 0 === a ? !0 : a;
      var b, c = this.trashcanTop;
      b = a ? {translateX:15, translateY:-25, rotateZ:30} : {translateX:0, translateY:0, rotateZ:0};
      $(c).velocity(b, {duration:50});
      this.isOver = a;
    }
  };
  b.setBoard = function(a) {
    this._dragBlockObserver && this._dragBlockObserver.destroy();
    this.board = a;
    this.svgGroup || this._generateView();
    var b = a.svg, c = b.firstChild;
    c ? b.insertBefore(this.svgGroup, c) : b.appendChild(this.svgGroup);
    this._dragBlockObserver = a.observe(this, "updateDragBlock", ["dragBlock"]);
    this.svgGroup.attr({filter:"url(#entryTrashcanFilter_" + a.suffix + ")"});
    this.setPosition();
  };
})(Entry.FieldTrashcan.prototype);
Entry.Vim = function(b, a) {
  Entry.Vim.MAZE_MODE = 0;
  Entry.Vim.WORKSPACE_MODE = 1;
  Entry.Vim.TEXT_TYPE_JS = 0;
  Entry.Vim.TEXT_TYPE_PY = 1;
  Entry.Vim.PARSER_TYPE_JS_TO_BLOCK = 0;
  Entry.Vim.PARSER_TYPE_PY_TO_BLOCK = 1;
  Entry.Vim.PARSER_TYPE_BLOCK_TO_JS = 2;
  Entry.Vim.PARSER_TYPE_BLOCK_TO_PY = 3;
  b = "string" === typeof b ? $("#" + b) : $(b);
  if ("DIV" !== b.prop("tagName")) {
    return console.error("Dom is not div element");
  }
  this.createDom(b);
  this._mode = Entry.Vim.WORKSPACE_MODE;
  this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS;
  this._parser = new Entry.Parser(this._mode, this._parserType, this.codeMirror);
  Entry.Model(this, !1);
  window.eventset = [];
};
(function(b) {
  b.createDom = function(a) {
    function b(a) {
      var c = e.getCodeToText(a.block);
      e.codeMirror.display.dragFunctions.leave(a);
      a = new MouseEvent("mousedown", {view:window, bubbles:!0, cancelable:!0, clientX:a.clientX, clientY:a.clientY});
      e.codeMirror.display.scroller.dispatchEvent(a);
      var c = c.split("\n"), d = c.length - 1, k = 0;
      c.forEach(function(a, b) {
        e.codeMirror.replaceSelection(a);
        k = e.doc.getCursor().line;
        e.codeMirror.indentLine(k);
        0 !== b && d === b || e.codeMirror.replaceSelection("\n");
      });
    }
    function c(a) {
      e.codeMirror.display.dragFunctions.over(a);
    }
    var e;
    this.view = Entry.Dom("div", {parent:a, class:"entryVimBoard"});
    this.codeMirror = CodeMirror(this.view[0], {lineNumbers:!0, value:"", mode:{name:"javascript", globalVars:!0}, theme:"default", indentUnit:4, styleActiveLine:!0, extraKeys:{"Ctrl-Space":"autocomplete", Tab:function(a) {
      var b = Array(a.getOption("indentUnit") + 1).join(" ");
      a.replaceSelection(b);
    }}, lint:!0, viewportMargin:10});
    this.doc = this.codeMirror.getDoc();
    e = this;
    a = this.view[0];
    a.removeEventListener("dragEnd", b);
    a.removeEventListener("dragOver", c);
    a.addEventListener("dragEnd", b);
    a.addEventListener("dragOver", c);
  };
  b.hide = function() {
    this.view.addClass("entryRemove");
  };
  b.show = function() {
    this.view.removeClass("entryRemove");
  };
  b.textToCode = function() {
    var a = this.workspace.textType;
    a === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : a === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this.codeMirror.getValue();
    a = this._parser.parse(a);
    if (0 === a.length) {
      throw "\ube14\ub85d \ud30c\uc2f1 \uc624\ub958";
    }
    return a;
  };
  b.codeToText = function(a) {
    var b = this.workspace.textType;
    b === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : b === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    a = this._parser.parse(a);
    this.codeMirror.setValue(a);
  };
  b.getCodeToText = function(a) {
    var b = this.workspace.textType;
    b === Entry.Vim.TEXT_TYPE_JS ? (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS, this._parser.setParser(this._mode, this._parserType, this.codeMirror)) : b === Entry.Vim.TEXT_TYPE_PY && (this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY, this._parser.setParser(this._mode, this._parserType, this.codeMirror));
    return this._parser.parse(a);
  };
})(Entry.Vim.prototype);
Entry.Workspace = function(b) {
  Entry.Model(this, !1);
  this.observe(this, "_handleChangeBoard", ["selectedBoard"], !1);
  this.trashcan = new Entry.FieldTrashcan;
  var a = b.blockMenu;
  a && (this.blockMenu = new Entry.BlockMenu(a.dom, a.align, a.categoryData, a.scroll), this.blockMenu.workspace = this, this.blockMenu.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1));
  if (a = b.board) {
    a.workspace = this, this.board = new Entry.Board(a), this.board.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1), this.set({selectedBoard:this.board});
  }
  if (a = b.vimBoard) {
    this.vimBoard = new Entry.Vim(a.dom), this.vimBoard.workspace = this;
  }
  this.board && this.vimBoard && this.vimBoard.hide();
  Entry.GlobalSvg.createDom();
  this.mode = Entry.Workspace.MODE_BOARD;
  Entry.keyPressed && Entry.keyPressed.attach(this, this._keyboardControl);
  this.changeEvent = new Entry.Event(this);
  Entry.commander.setCurrentEditor("board", this.board);
};
Entry.Workspace.MODE_BOARD = 0;
Entry.Workspace.MODE_VIMBOARD = 1;
Entry.Workspace.MODE_OVERLAYBOARD = 2;
(function(b) {
  b.schema = {selectedBlockView:null, selectedBoard:null};
  b.getBoard = function() {
    return this.board;
  };
  b.getSelectedBoard = function() {
    return this.selectedBoard;
  };
  b.getBlockMenu = function() {
    return this.blockMenu;
  };
  b.getVimBoard = function() {
    return this.vimBoard;
  };
  b.getMode = function() {
    return this.mode;
  };
  b.setMode = function(a, b) {
    a = Number(a);
    var c = this.mode;
    switch(a) {
      case c:
        return;
      case Entry.Workspace.MODE_VIMBOARD:
        this.board && this.board.hide();
        this.overlayBoard && this.overlayBoard.hide();
        this.textType = b;
        this.set({selectedBoard:this.vimBoard});
        this.vimBoard.show();
        this.codeToText(this.board.code);
        this.blockMenu.renderText();
        this.board.clear();
        this.mode = a;
        break;
      case Entry.Workspace.MODE_BOARD:
        try {
          this.vimBoard && this.vimBoard.hide(), this.overlayBoard && this.overlayBoard.hide(), this.board.show(), this.set({selectedBoard:this.board}), this.textToCode(c), this.vimBoard && this.vimBoard.hide(), this.overlayBoard && this.overlayBoard.hide(), this.blockMenu.renderBlock(), this.textType = b, this.mode = a;
        } catch (e) {
          throw this.board && this.board.hide(), this.set({selectedBoard:this.vimBoard}), Entry.dispatchEvent("setProgrammingMode", Entry.Workspace.MODE_VIMBOARD), e;
        }
        Entry.commander.setCurrentEditor("board", this.board);
        break;
      case Entry.Workspace.MODE_OVERLAYBOARD:
        this.overlayBoard || this.initOverlayBoard(), this.overlayBoard.show(), this.set({selectedBoard:this.overlayBoard}), Entry.commander.setCurrentEditor("board", this.overlayBoard);
    }
    this.changeEvent.notify(b);
  };
  b.changeBoardCode = function(a) {
    this.board.changeCode(a);
  };
  b.changeOverlayBoardCode = function(a) {
    this.overlayBoard && this.overlayBoard.changeCode(a);
  };
  b.changeBlockMenuCode = function(a) {
    this.blockMenu.changeCode(a);
  };
  b.textToCode = function(a) {
    if (a == Entry.Workspace.MODE_VIMBOARD) {
      a = this.vimBoard.textToCode();
      var b = this.board, c = b.code;
      c.load(a);
      c.createView(b);
      this.board.alignThreads();
      this.board.reDraw();
    }
  };
  b.codeToText = function(a) {
    return this.vimBoard.codeToText(a);
  };
  b.getCodeToText = function(a) {
    return this.vimBoard.getCodeToText(a);
  };
  b._setSelectedBlockView = function() {
    this.set({selectedBlockView:this.board.selectedBlockView || this.blockMenu.selectedBlockView || (this.overlayBoard ? this.overlayBoard.selectedBlockView : null)});
  };
  b.initOverlayBoard = function() {
    this.overlayBoard = new Entry.Board({dom:this.board.view, workspace:this, isOverlay:!0});
    this.overlayBoard.changeCode(new Entry.Code([]));
    this.overlayBoard.workspace = this;
    this.overlayBoard.observe(this, "_setSelectedBlockView", ["selectedBlockView"], !1);
  };
  b._keyboardControl = function(a) {
    var b = a.keyCode || a.which, c = a.ctrlKey;
    if (!Entry.Utils.isInInput(a)) {
      var e = this.selectedBlockView;
      e && !e.isInBlockMenu && e.block.isDeletable() && (8 == b || 46 == b ? (Entry.do("destroyBlock", e.block), a.preventDefault()) : c && (67 == b ? e.block.copyToClipboard() : 88 == b && (a = e.block, a.copyToClipboard(), a.destroy(!0, !0), e.getBoard().setSelectedBlock(null))));
      c && 86 == b && (b = this.selectedBoard) && b instanceof Entry.Board && Entry.clipboard && Entry.do("addThread", Entry.clipboard).value.getFirstBlock().copyToClipboard();
    }
  };
  b._handleChangeBoard = function() {
    var a = this.selectedBoard;
    a && a.constructor === Entry.Board && this.trashcan.setBoard(a);
  };
})(Entry.Workspace.prototype);
Entry.Playground = function() {
  this.enableArduino = this.isTextBGMode_ = !1;
  this.viewMode_ = "default";
  var b = this;
  Entry.addEventListener("textEdited", this.injectText);
  Entry.addEventListener("hwChanged", this.updateHW);
  Entry.addEventListener("changeMode", function(a) {
    b.setMode(a);
  });
};
Entry.Playground.prototype.setMode = function(b) {
  this.boardType = b.boardType;
  this.textType = b.textType;
  this.mainWorkspace.setMode(b.boardType, b.textType);
};
Entry.Playground.prototype.generateView = function(b, a) {
  this.view_ = b;
  this.view_.addClass("entryPlayground");
  if (a && "workspace" != a) {
    "phone" == a && (this.view_.addClass("entryPlaygroundPhone"), d = Entry.createElement("div", "entryCategoryTab"), d.addClass("entryPlaygroundTabPhone"), Entry.view_.insertBefore(d, this.view_), this.generateTabView(d), this.tabView_ = d, d = Entry.createElement("div", "entryCurtain"), d.addClass("entryPlaygroundCurtainPhone"), d.addClass("entryRemove"), d.innerHTML = Lang.Workspace.cannot_edit_click_to_stop, d.bindOnClick(function() {
      Entry.engine.toggleStop();
    }), this.view_.appendChild(d), this.curtainView_ = d, Entry.pictureEditable && (d = Entry.createElement("div", "entryPicture"), d.addClass("entryPlaygroundPicturePhone"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generatePictureView(d), this.pictureView_ = d), d = Entry.createElement("div", "entryText"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generateTextView(d), this.textView_ = d, Entry.soundEditable && (d = Entry.createElement("div", "entrySound"), d.addClass("entryPlaygroundSoundWorkspacePhone"), 
    d.addClass("entryRemove"), this.view_.appendChild(d), this.generateSoundView(d), this.soundView_ = d), d = Entry.createElement("div", "entryDefault"), this.view_.appendChild(d), this.generateDefaultView(d), this.defaultView_ = d, d = Entry.createElement("div", "entryCode"), d.addClass("entryPlaygroundCodePhone"), this.view_.appendChild(d), this.generateCodeView(d), this.codeView_ = this.codeView_ = d, Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    }), Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    }));
  } else {
    this.view_.addClass("entryPlaygroundWorkspace");
    var d = Entry.createElement("div", "entryCategoryTab");
    d.addClass("entryPlaygroundTabWorkspace");
    this.view_.appendChild(d);
    this.generateTabView(d);
    this.tabView_ = d;
    d = Entry.createElement("div", "entryCurtain");
    d.addClass("entryPlaygroundCurtainWorkspace");
    d.addClass("entryRemove");
    var c = Lang.Workspace.cannot_edit_click_to_stop.split(".");
    d.innerHTML = c[0] + ".<br/>" + c[1];
    d.addEventListener("click", function() {
      Entry.engine.toggleStop();
    });
    this.view_.appendChild(d);
    this.curtainView_ = d;
    Entry.pictureEditable && (d = Entry.createElement("div", "entryPicture"), d.addClass("entryPlaygroundPictureWorkspace"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generatePictureView(d), this.pictureView_ = d);
    d = Entry.createElement("div", "entryText");
    d.addClass("entryPlaygroundTextWorkspace");
    d.addClass("entryRemove");
    this.view_.appendChild(d);
    this.generateTextView(d);
    this.textView_ = d;
    Entry.soundEditable && (d = Entry.createElement("div", "entrySound"), d.addClass("entryPlaygroundSoundWorkspace"), d.addClass("entryRemove"), this.view_.appendChild(d), this.generateSoundView(d), this.soundView_ = d);
    d = Entry.createElement("div", "entryDefault");
    d.addClass("entryPlaygroundDefaultWorkspace");
    this.view_.appendChild(d);
    this.generateDefaultView(d);
    this.defaultView_ = d;
    d = Entry.createElement("div", "entryCode");
    d.addClass("entryPlaygroundCodeWorkspace");
    d.addClass("entryRemove");
    this.view_.appendChild(d);
    this.generateCodeView(d);
    this.codeView_ = d;
    c = Entry.createElement("div");
    c.addClass("entryPlaygroundResizeWorkspace", "entryRemove");
    this.resizeHandle_ = c;
    this.view_.appendChild(c);
    this.initializeResizeHandle(c);
    this.codeView_ = d;
    Entry.addEventListener("run", function(a) {
      Entry.playground.curtainView_.removeClass("entryRemove");
    });
    Entry.addEventListener("stop", function(a) {
      Entry.playground.curtainView_.addClass("entryRemove");
    });
  }
};
Entry.Playground.prototype.generateDefaultView = function(b) {
  return b;
};
Entry.Playground.prototype.generateTabView = function(b) {
  var a = this, d = Entry.createElement("ul");
  d.addClass("entryTabListWorkspace");
  this.tabList_ = d;
  b.appendChild(d);
  this.tabViewElements = {};
  b = Entry.createElement("li", "entryCodeTab");
  b.innerHTML = Lang.Workspace.tab_code;
  b.addClass("entryTabListItemWorkspace");
  b.addClass("entryTabSelected");
  d.appendChild(b);
  b.bindOnClick(function(b) {
    a.changeViewMode("code");
    a.blockMenu.reDraw();
  });
  this.tabViewElements.code = b;
  Entry.pictureEditable && (b = Entry.createElement("li", "entryPictureTab"), b.innerHTML = Lang.Workspace.tab_picture, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("picture");
  }), this.tabViewElements.picture = b, b = Entry.createElement("li", "entryTextboxTab"), b.innerHTML = Lang.Workspace.tab_text, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("text");
  }), this.tabViewElements.text = b, b.addClass("entryRemove"));
  Entry.soundEditable && (b = Entry.createElement("li", "entrySoundTab"), b.innerHTML = Lang.Workspace.tab_sound, b.addClass("entryTabListItemWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.changeViewMode("sound");
  }), this.tabViewElements.sound = b);
  Entry.hasVariableManager && (b = Entry.createElement("li", "entryVariableTab"), b.innerHTML = Lang.Workspace.tab_attribute, b.addClass("entryTabListItemWorkspace"), b.addClass("entryVariableTabWorkspace"), d.appendChild(b), b.bindOnClick(function(a) {
    Entry.playground.toggleOnVariableView();
    Entry.playground.changeViewMode("variable");
  }), this.tabViewElements.variable = b);
};
Entry.Playground.prototype.generateCodeView = function(b) {
  var a = this.createVariableView();
  b.appendChild(a);
  this.variableView_ = a;
  b = Entry.Dom(b);
  a = Entry.Dom("div", {parent:b, id:"entryWorkspaceBoard", class:"entryWorkspaceBoard"});
  b = Entry.Dom("div", {parent:b, id:"entryWorkspaceBlockMenu", class:"entryWorkspaceBlockMenu"});
  this.mainWorkspace = new Entry.Workspace({blockMenu:{dom:b, align:"LEFT", categoryData:EntryStatic.getAllBlocks(), scroll:!0}, board:{dom:a}, vimBoard:{dom:a}});
  this.blockMenu = this.mainWorkspace.blockMenu;
  this.board = this.mainWorkspace.board;
  this.vimBoard = this.mainWorkspace.vimBoard;
  Entry.hw && this.updateHW();
};
Entry.Playground.prototype.generatePictureView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddPicture");
    a.addClass("entryPlaygroundAddPicture");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    });
    var d = Entry.createElement("div", "entryAddPictureInner");
    d.addClass("entryPlaygroundAddPictureInner");
    d.innerHTML = Lang.Workspace.picture_add;
    a.appendChild(d);
    b.appendChild(a);
    a = Entry.createElement("ul", "entryPictureList");
    a.addClass("entryPlaygroundPictureList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(d, g);
    }, axis:"y"});
    b.appendChild(a);
    this.pictureListView_ = a;
    a = Entry.createElement("div", "entryPainter");
    a.addClass("entryPlaygroundPainter");
    b.appendChild(a);
    this.painter = new Entry.Painter;
    this.painter.initialize(a);
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddPicture"), a.addClass("entryPlaygroundAddPicturePhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openPictureManager");
    }), d = Entry.createElement("div", "entryAddPictureInner"), d.addClass("entryPlaygroundAddPictureInnerPhone"), d.innerHTML = Lang.Workspace.picture_add, a.appendChild(d), b.appendChild(a), a = Entry.createElement("ul", "entryPictureList"), a.addClass("entryPlaygroundPictureListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.movePicture(d, g);
    }, axis:"y"}), b.appendChild(a), this.pictureListView_ = a);
  }
};
Entry.Playground.prototype.generateTextView = function(b) {
  var a = Entry.createElement("div");
  b.appendChild(a);
  b = Entry.createElement("div");
  b.addClass("textProperties");
  a.appendChild(b);
  var d = Entry.createElement("div");
  d.addClass("entryTextFontSelect");
  b.appendChild(d);
  var c = Entry.createElement("select", "entryPainterAttrFontName");
  c.addClass("entryPlaygroundPainterAttrFontName", "entryTextFontSelecter");
  c.size = "1";
  c.onchange = function(a) {
    Entry.playground.object.entity.setFontType(a.target.value);
  };
  for (var e = 0;e < Entry.fonts.length;e++) {
    var f = Entry.fonts[e], g = Entry.createElement("option");
    g.value = f.family;
    g.innerHTML = f.name;
    c.appendChild(g);
  }
  this.fontName_ = c;
  d.appendChild(c);
  e = Entry.createElement("ul");
  e.addClass("entryPlayground_text_buttons");
  b.appendChild(e);
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignLeft");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
  });
  e.appendChild(d);
  this.alignLeftBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignCenter");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
  });
  e.appendChild(d);
  this.alignCenterBtn = d;
  d = Entry.createElement("li");
  d.addClass("entryPlaygroundTextAlignRight");
  d.bindOnClick(function(a) {
    Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
  });
  e.appendChild(d);
  this.alignRightBtn = d;
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontBold() ? h.src = Entry.mediaFilePath + "text_button_bold_true.png" : h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  });
  var h = Entry.createElement("img", "entryPlaygroundText_boldImage");
  c.appendChild(h);
  h.src = Entry.mediaFilePath + "text_button_bold_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getUnderLine() || !1;
    k.src = Entry.mediaFilePath + "text_button_underline_" + a + ".png";
    Entry.playground.object.entity.setUnderLine(a);
  });
  var k = Entry.createElement("img", "entryPlaygroundText_underlineImage");
  c.appendChild(k);
  k.src = Entry.mediaFilePath + "text_button_underline_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    Entry.playground.object.entity.toggleFontItalic() ? l.src = Entry.mediaFilePath + "text_button_italic_true.png" : l.src = Entry.mediaFilePath + "/text_button_italic_false.png";
  });
  var l = Entry.createElement("img", "entryPlaygroundText_italicImage");
  c.appendChild(l);
  l.src = Entry.mediaFilePath + "text_button_italic_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  c = Entry.createElement("a");
  d.appendChild(c);
  c.bindOnClick(function() {
    var a = !Entry.playground.object.entity.getStrike() || !1;
    Entry.playground.object.entity.setStrike(a);
    n.src = Entry.mediaFilePath + "text_button_strike_" + a + ".png";
  });
  var n = Entry.createElement("img", "entryPlaygroundText_strikeImage");
  c.appendChild(n);
  n.src = Entry.mediaFilePath + "text_button_strike_false.png";
  c = Entry.createElement("li");
  e.appendChild(c);
  d = Entry.createElement("a");
  c.appendChild(d);
  d.bindOnClick(function() {
    Entry.playground.toggleColourChooser("foreground");
  });
  c = Entry.createElement("img");
  d.appendChild(c);
  c.src = Entry.mediaFilePath + "text_button_color_false.png";
  d = Entry.createElement("li");
  e.appendChild(d);
  e = Entry.createElement("a");
  d.appendChild(e);
  e.bindOnClick(function() {
    Entry.playground.toggleColourChooser("background");
  });
  d = Entry.createElement("img");
  e.appendChild(d);
  d.src = Entry.mediaFilePath + "text_button_background_false.png";
  e = Entry.createElement("div");
  e.addClass("entryPlayground_fgColorDiv");
  d = Entry.createElement("div");
  d.addClass("entryPlayground_bgColorDiv");
  b.appendChild(e);
  b.appendChild(d);
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextColoursWrapper");
  this.coloursWrapper = c;
  a.appendChild(c);
  b = Entry.getColourCodes();
  for (e = 0;e < b.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", b[e]), d.style.backgroundColor = b[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(a) {
      Entry.playground.setTextColour(a.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  c = Entry.createElement("div");
  c.addClass("entryPlaygroundTextBackgroundsWrapper");
  this.backgroundsWrapper = c;
  a.appendChild(c);
  for (e = 0;e < b.length;e++) {
    d = Entry.createElement("div"), d.addClass("modal_colour"), d.setAttribute("colour", b[e]), d.style.backgroundColor = b[e], 0 === e && d.addClass("modalColourTrans"), d.bindOnClick(function(a) {
      Entry.playground.setBackgroundColour(a.target.getAttribute("colour"));
    }), c.appendChild(d);
  }
  c.style.display = "none";
  b = Entry.createElement("input");
  b.addClass("entryPlayground_textBox");
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditInput = b;
  a.appendChild(b);
  b = Entry.createElement("textarea");
  b.addClass("entryPlayground_textArea");
  b.style.display = "none";
  b.onkeyup = function() {
    Entry.playground.object.setText(this.value);
    Entry.playground.object.entity.setText(this.value);
  };
  b.onblur = function() {
    Entry.dispatchEvent("textEdited");
  };
  this.textEditArea = b;
  a.appendChild(b);
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundFontSizeWrapper");
  a.appendChild(b);
  this.fontSizeWrapper = b;
  var m = Entry.createElement("div");
  m.addClass("entryPlaygroundFontSizeSlider");
  b.appendChild(m);
  var q = Entry.createElement("div");
  q.addClass("entryPlaygroundFontSizeIndicator");
  m.appendChild(q);
  this.fontSizeIndiciator = q;
  var r = Entry.createElement("div");
  r.addClass("entryPlaygroundFontSizeKnob");
  m.appendChild(r);
  this.fontSizeKnob = r;
  e = Entry.createElement("div");
  e.addClass("entryPlaygroundFontSizeLabel");
  e.innerHTML = "\uae00\uc790 \ud06c\uae30";
  b.appendChild(e);
  var u = !1, t = 0;
  r.onmousedown = function(a) {
    u = !0;
    t = $(m).offset().left;
  };
  document.addEventListener("mousemove", function(a) {
    u && (a = a.pageX - t, a = Math.max(a, 5), a = Math.min(a, 88), r.style.left = a + "px", a /= .88, q.style.width = a + "%", Entry.playground.object.entity.setFontSize(a));
  });
  document.addEventListener("mouseup", function(a) {
    u = !1;
  });
  b = Entry.createElement("div");
  b.addClass("entryPlaygroundLinebreakWrapper");
  a.appendChild(b);
  a = Entry.createElement("hr");
  a.addClass("entryPlaygroundLinebreakHorizontal");
  b.appendChild(a);
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakButtons");
  b.appendChild(a);
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!1);
    v.innerHTML = Lang.Menus.linebreak_off_desc_1;
    x.innerHTML = Lang.Menus.linebreak_off_desc_2;
    y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-off-true.png";
  a.appendChild(e);
  this.linebreakOffImage = e;
  e = Entry.createElement("img");
  e.bindOnClick(function() {
    Entry.playground.toggleLineBreak(!0);
    v.innerHTML = Lang.Menus.linebreak_on_desc_1;
    x.innerHTML = Lang.Menus.linebreak_on_desc_2;
    y.innerHTML = Lang.Menus.linebreak_on_desc_3;
  });
  e.src = Entry.mediaFilePath + "text-linebreak-on-false.png";
  a.appendChild(e);
  this.linebreakOnImage = e;
  a = Entry.createElement("div");
  a.addClass("entryPlaygroundLinebreakDescription");
  b.appendChild(a);
  var v = Entry.createElement("p");
  v.innerHTML = Lang.Menus.linebreak_off_desc_1;
  a.appendChild(v);
  b = Entry.createElement("ul");
  a.appendChild(b);
  var x = Entry.createElement("li");
  x.innerHTML = Lang.Menus.linebreak_off_desc_2;
  b.appendChild(x);
  var y = Entry.createElement("li");
  y.innerHTML = Lang.Menus.linebreak_off_desc_3;
  b.appendChild(y);
};
Entry.Playground.prototype.generateSoundView = function(b) {
  if ("workspace" == Entry.type) {
    var a = Entry.createElement("div", "entryAddSound");
    a.addClass("entryPlaygroundAddSound");
    a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    });
    var d = Entry.createElement("div", "entryAddSoundInner");
    d.addClass("entryPlaygroundAddSoundInner");
    d.innerHTML = Lang.Workspace.sound_add;
    a.appendChild(d);
    b.appendChild(a);
    a = Entry.createElement("ul", "entrySoundList");
    a.addClass("entryPlaygroundSoundList");
    $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(d, g);
    }, axis:"y"});
    b.appendChild(a);
    this.soundListView_ = a;
  } else {
    "phone" == Entry.type && (a = Entry.createElement("div", "entryAddSound"), a.addClass("entryPlaygroundAddSoundPhone"), a.bindOnClick(function(a) {
      Entry.dispatchEvent("openSoundManager");
    }), d = Entry.createElement("div", "entryAddSoundInner"), d.addClass("entryPlaygroundAddSoundInnerPhone"), d.innerHTML = Lang.Workspace.sound_add, a.appendChild(d), b.appendChild(a), a = Entry.createElement("ul", "entrySoundList"), a.addClass("entryPlaygroundSoundListPhone"), $ && $(a).sortable({start:function(a, b) {
      b.item.data("start_pos", b.item.index());
    }, stop:function(a, b) {
      var d = b.item.data("start_pos"), g = b.item.index();
      Entry.playground.moveSound(d, g);
    }, axis:"y"}), b.appendChild(a), this.soundListView_ = a);
  }
};
Entry.Playground.prototype.injectObject = function(b) {
  if (!b) {
    this.changeViewMode("code"), this.object = null;
  } else {
    if (b !== this.object) {
      this.object && this.object.toggleInformation(!1);
      this.object = b;
      this.setMenu(b.objectType);
      this.injectCode();
      "sprite" == b.objectType && Entry.pictureEditable ? (this.tabViewElements.text && this.tabViewElements.text.addClass("entryRemove"), this.tabViewElements.picture && this.tabViewElements.picture.removeClass("entryRemove")) : "textBox" == b.objectType && (this.tabViewElements.picture && this.tabViewElements.picture.addClass("entryRemove"), this.tabViewElements.text && this.tabViewElements.text.removeClass("entryRemove"));
      var a = this.viewMode_;
      "default" == a ? this.changeViewMode("code") : "picture" != a && "text" != a || "textBox" != b.objectType ? "text" != a && "picture" != a || "sprite" != b.objectType ? "sound" == a && this.changeViewMode("sound") : this.changeViewMode("picture") : this.changeViewMode("text");
      this.reloadPlayground();
    }
  }
};
Entry.Playground.prototype.injectCode = function() {
  this.mainWorkspace.changeBoardCode(this.object.script);
};
Entry.Playground.prototype.adjustScroll = function(b, a) {
  var d = Blockly.mainWorkspace.scrollbar.vScroll;
  Blockly.mainWorkspace.scrollbar.hScroll.svgGroup_.setAttribute("opacity", "1");
  d.svgGroup_.setAttribute("opacity", "1");
  if (Blockly.mainWorkspace.getMetrics()) {
    Blockly.removeAllRanges();
    var d = Blockly.mainWorkspace.getMetrics(), c, e;
    c = Math.min(b, -d.contentLeft);
    e = Math.min(a, -d.contentTop);
    c = Math.max(c, d.viewWidth - d.contentLeft - d.contentWidth);
    e = Math.max(e, d.viewHeight - d.contentTop - d.contentHeight);
    Blockly.mainWorkspace.scrollbar.set(-c - d.contentLeft, -e - d.contentTop);
  }
};
Entry.Playground.prototype.injectPicture = function() {
  var b = this.pictureListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.pictures, d = 0, c = a.length;d < c;d++) {
        var e = a[d].view;
        e || console.log(e);
        e.orderHolder.innerHTML = d + 1;
        b.appendChild(e);
      }
      this.selectPicture(this.object.selectedPicture);
    } else {
      Entry.dispatchEvent("pictureClear");
    }
  }
};
Entry.Playground.prototype.addPicture = function(b, a) {
  var d = Entry.cloneSimpleObject(b);
  delete d.id;
  delete d.view;
  b = JSON.parse(JSON.stringify(d));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.pictures);
  this.generatePictureElement(b);
  this.object.addPicture(b);
  this.injectPicture();
  this.selectPicture(b);
};
Entry.Playground.prototype.setPicture = function(b) {
  var a = Entry.container.getPictureElement(b.id), d = $(a);
  if (a) {
    b.view = a;
    a.picture = b;
    a = d.find("#t_" + b.id)[0];
    if (b.fileurl) {
      a.style.backgroundImage = 'url("' + b.fileurl + '")';
    } else {
      var c = b.filename;
      a.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + c.substring(0, 2) + "/" + c.substring(2, 4) + "/thumb/" + c + '.png")';
    }
    d.find("#s_" + b.id)[0].innerHTML = b.dimension.width + " X " + b.dimension.height;
  }
  Entry.container.setPicture(b);
};
Entry.Playground.prototype.clonePicture = function(b) {
  b = Entry.playground.object.getPicture(b);
  this.addPicture(b, !0);
};
Entry.Playground.prototype.selectPicture = function(b) {
  for (var a = this.object.pictures, d = 0, c = a.length;d < c;d++) {
    var e = a[d];
    e.id === b.id ? e.view.addClass("entryPictureSelected") : e.view.removeClass("entryPictureSelected");
  }
  var f;
  b && b.id && (f = Entry.container.selectPicture(b.id));
  this.object.id === f && Entry.dispatchEvent("pictureSelected", b);
};
Entry.Playground.prototype.movePicture = function(b, a) {
  this.object.pictures.splice(a, 0, this.object.pictures.splice(b, 1)[0]);
  this.injectPicture();
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.injectText = function() {
  if (Entry.playground.object) {
    Entry.playground.textEditInput.value = Entry.playground.object.entity.getText();
    Entry.playground.textEditArea.value = Entry.playground.object.entity.getText();
    Entry.playground.fontName_.value = Entry.playground.object.entity.getFontName();
    if (Entry.playground.object.entity.font) {
      var b = -1 < Entry.playground.object.entity.font.indexOf("bold") || !1;
      $("#entryPlaygroundText_boldImage").attr("src", Entry.mediaFilePath + "text_button_bold_" + b + ".png");
      b = -1 < Entry.playground.object.entity.font.indexOf("italic") || !1;
      $("#entryPlaygroundText_italicImage").attr("src", Entry.mediaFilePath + "text_button_italic_" + b + ".png");
    }
    b = Entry.playground.object.entity.getUnderLine() || !1;
    $("#entryPlaygroundText_underlineImage").attr("src", Entry.mediaFilePath + "text_button_underline_" + b + ".png");
    b = Entry.playground.object.entity.getStrike() || !1;
    $("#entryPlaygroundText_strikeImage").attr("src", Entry.mediaFilePath + "text_button_strike_" + b + ".png");
    $(".entryPlayground_fgColorDiv").css("backgroundColor", Entry.playground.object.entity.colour);
    $(".entryPlayground_bgColorDiv").css("backgroundColor", Entry.playground.object.entity.bgColour);
    Entry.playground.toggleLineBreak(Entry.playground.object.entity.getLineBreak());
    Entry.playground.object.entity.getLineBreak() && ($(".entryPlaygroundLinebreakDescription > p").html(Lang.Menus.linebreak_on_desc_1), $(".entryPlaygroundLinebreakDescription > ul > li").eq(0).html(Lang.Menus.linebreak_on_desc_2), $(".entryPlaygroundLinebreakDescription > ul > li").eq(1).html(Lang.Menus.linebreak_on_desc_3));
    Entry.playground.setFontAlign(Entry.playground.object.entity.getTextAlign());
    b = Entry.playground.object.entity.getFontSize();
    Entry.playground.fontSizeIndiciator.style.width = b + "%";
    Entry.playground.fontSizeKnob.style.left = .88 * b + "px";
  }
};
Entry.Playground.prototype.injectSound = function() {
  var b = this.soundListView_;
  if (b) {
    for (;b.hasChildNodes();) {
      b.removeChild(b.lastChild);
    }
    if (this.object) {
      for (var a = this.object.sounds, d = 0, c = a.length;d < c;d++) {
        var e = a[d].view;
        e.orderHolder.innerHTML = d + 1;
        b.appendChild(e);
      }
    }
  }
};
Entry.Playground.prototype.moveSound = function(b, a) {
  this.object.sounds.splice(a, 0, this.object.sounds.splice(b, 1)[0]);
  this.updateListViewOrder("sound");
  Entry.stage.sortZorder();
};
Entry.Playground.prototype.addSound = function(b, a) {
  var d = Entry.cloneSimpleObject(b);
  delete d.view;
  delete d.id;
  b = JSON.parse(JSON.stringify(d));
  b.id = Entry.generateHash();
  b.name = Entry.getOrderedName(b.name, this.object.sounds);
  this.generateSoundElement(b);
  this.object.addSound(b);
  this.injectSound();
};
Entry.Playground.prototype.changeViewMode = function(b) {
  for (var a in this.tabViewElements) {
    this.tabViewElements[a].removeClass("entryTabSelected");
  }
  "default" != b && this.tabViewElements[b].addClass("entryTabSelected");
  if ("variable" != b) {
    var d = this.view_.children;
    for (a = 0;a < d.length;a++) {
      var c = d[a];
      -1 < c.id.toUpperCase().indexOf(b.toUpperCase()) ? c.removeClass("entryRemove") : c.addClass("entryRemove");
    }
    if ("picture" == b && (!this.pictureView_.object || this.pictureView_.object != this.object)) {
      this.pictureView_.object = this.object, this.injectPicture();
    } else {
      if ("sound" == b && (!this.soundView_.object || this.soundView_.object != this.object)) {
        this.soundView_.object = this.object, this.injectSound();
      } else {
        if ("text" == b && "textBox" == this.object.objectType || this.textView_.object != this.object) {
          this.textView_.object = this.object, this.injectText();
        }
      }
    }
    "code" == b && this.resizeHandle_ && this.resizeHandle_.removeClass("entryRemove");
    Entry.engine.isState("run") && this.curtainView_.removeClass("entryRemove");
    this.viewMode_ = b;
    this.toggleOffVariableView();
  }
};
Entry.Playground.prototype.createVariableView = function() {
  var b = Entry.createElement("div");
  Entry.type && "workspace" != Entry.type ? "phone" == Entry.type && b.addClass("entryVariablePanelPhone") : b.addClass("entryVariablePanelWorkspace");
  this.variableViewWrapper_ = b;
  Entry.variableContainer.createDom(b);
  return b;
};
Entry.Playground.prototype.toggleOnVariableView = function() {
  Entry.playground.changeViewMode("code");
  this.hideBlockMenu();
  Entry.variableContainer.updateList();
  this.variableView_.removeClass("entryRemove");
  this.resizeHandle_.removeClass("entryRemove");
};
Entry.Playground.prototype.toggleOffVariableView = function() {
  this.showBlockMenu();
  this.variableView_.addClass("entryRemove");
};
Entry.Playground.prototype.editBlock = function() {
  var b = Entry.playground;
  Entry.stateManager && Entry.stateManager.addCommand("edit block", b, b.restoreBlock, b.object, b.object.getScriptText());
};
Entry.Playground.prototype.mouseupBlock = function() {
  if (Entry.reporter) {
    var b = Entry.playground, a = b.object;
    Entry.reporter.report(new Entry.State("edit block mouseup", b, b.restoreBlock, a, a.getScriptText()));
  }
};
Entry.Playground.prototype.restoreBlock = function(b, a) {
  Entry.container.selectObject(b.id);
  Entry.stateManager && Entry.stateManager.addCommand("restore block", this, this.restoreBlock, this.object, this.object.getScriptText());
  Blockly.Xml.textToDom(a);
};
Entry.Playground.prototype.setMenu = function(b) {
  if (this.currentObjectType != b) {
    var a = this.blockMenu;
    a.unbanClass(this.currentObjectType);
    a.banClass(b);
    a.setMenu();
    a.selectMenu(0, !0);
    this.currentObjectType = b;
  }
};
Entry.Playground.prototype.hideTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.hideTab([b[a]]);
  }
};
Entry.Playground.prototype.hideTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("hideTab"), this.tabViewElements[b].removeClass("showTab"));
};
Entry.Playground.prototype.showTabs = function() {
  var b = ["picture", "text", "sound", "variable"], a;
  for (a in b) {
    this.showTab(b[a]);
  }
};
Entry.Playground.prototype.showTab = function(b) {
  this.tabViewElements[b] && (this.tabViewElements[b].addClass("showTab"), this.tabViewElements[b].removeClass("hideTab"));
};
Entry.Playground.prototype.initializeResizeHandle = function(b) {
  b.onmousedown = function(a) {
    Entry.playground.resizing = !0;
    Entry.documentMousemove && (Entry.playground.resizeEvent = Entry.documentMousemove.attach(this, function(a) {
      Entry.playground.resizing && Entry.resizeElement({menuWidth:a.clientX - Entry.interfaceState.canvasWidth});
    }));
  };
  document.addEventListener("mouseup", function(a) {
    if (a = Entry.playground.resizeEvent) {
      Entry.playground.resizing = !1, Entry.documentMousemove.detach(a), delete Entry.playground.resizeEvent;
    }
  });
};
Entry.Playground.prototype.reloadPlayground = function() {
  var b = this.mainWorkspace;
  b && (b.getBlockMenu().reDraw(), this.object && this.object.script.view.reDraw());
};
Entry.Playground.prototype.flushPlayground = function() {
  this.object = null;
  if (Entry.playground && Entry.playground.view_) {
    this.injectPicture();
    this.injectSound();
    var b = Entry.playground.mainWorkspace.getBoard();
    b.clear();
    b.changeCode(null);
  }
};
Entry.Playground.prototype.refreshPlayground = function() {
  Entry.playground && Entry.playground.view_ && (this.injectPicture(), this.injectSound());
};
Entry.Playground.prototype.updateListViewOrder = function(b) {
  b = "picture" == b ? this.pictureListView_.childNodes : this.soundListView_.childNodes;
  for (var a = 0, d = b.length;a < d;a++) {
    b[a].orderHolder.innerHTML = a + 1;
  }
};
Entry.Playground.prototype.generatePictureElement = function(b) {
  function a() {
    if ("" === this.value.trim()) {
      Entry.deAttachEventListener(this, "blur", a), alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus(), Entry.attachEventListener(this, "blur", a);
    } else {
      for (var b = $(".entryPlaygroundPictureName"), c = 0;c < b.length;c++) {
        if (b.eq(c).val() == f.value && b[c] != this) {
          Entry.deAttachEventListener(this, "blur", a);
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          Entry.attachEventListener(this, "blur", a);
          return;
        }
      }
      this.picture.name = this.value;
      Entry.playground.reloadPlayground();
      Entry.dispatchEvent("pictureNameChanged", this.picture);
    }
  }
  var d = Entry.createElement("li", b.id);
  b.view = d;
  d.addClass("entryPlaygroundPictureElement");
  d.picture = b;
  d.bindOnClick(function(a) {
    Entry.playground.selectPicture(this.picture);
  });
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      f.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.clonePicture(b.id);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removePicture(b.id) ? (Entry.removeElement(d), Entry.toast.success(Lang.Workspace.shape_remove_ok, b.name + " " + Lang.Workspace.shape_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.shape_remove_fail, Lang.Workspace.shape_remove_fail_msg);
    }}, {divider:!0}, {text:Lang.Workspace.context_download, callback:function() {
      b.fileurl ? window.open(b.fileurl) : window.open("/api/sprite/download/image/" + encodeURIComponent(b.filename) + "/" + encodeURIComponent(b.name) + ".png");
    }}], "workspace-contextmenu");
  });
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundPictureOrder");
  d.orderHolder = c;
  d.appendChild(c);
  c = Entry.createElement("div", "t_" + b.id);
  c.addClass("entryPlaygroundPictureThumbnail");
  if (b.fileurl) {
    c.style.backgroundImage = 'url("' + b.fileurl + '")';
  } else {
    var e = b.filename;
    c.style.backgroundImage = 'url("' + Entry.defaultPath + "/uploads/" + e.substring(0, 2) + "/" + e.substring(2, 4) + "/thumb/" + e + '.png")';
  }
  d.appendChild(c);
  var f = Entry.createElement("input");
  f.addClass("entryPlaygroundPictureName");
  f.addClass("entryEllipsis");
  f.picture = b;
  f.value = b.name;
  Entry.attachEventListener(f, "blur", a);
  f.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  d.appendChild(f);
  c = Entry.createElement("div", "s_" + b.id);
  c.addClass("entryPlaygroundPictureSize");
  c.innerHTML = b.dimension.width + " X " + b.dimension.height;
  d.appendChild(c);
};
Entry.Playground.prototype.generateSoundElement = function(b) {
  var a = Entry.createElement("sound", b.id);
  b.view = a;
  a.addClass("entryPlaygroundSoundElement");
  a.sound = b;
  Entry.Utils.disableContextmenu(b.view);
  $(b.view).on("contextmenu", function() {
    Entry.ContextMenu.show([{text:Lang.Workspace.context_rename, callback:function() {
      g.focus();
    }}, {text:Lang.Workspace.context_duplicate, callback:function() {
      Entry.playground.addSound(b, !0);
    }}, {text:Lang.Workspace.context_remove, callback:function() {
      Entry.playground.object.removeSound(b.id) ? (Entry.removeElement(a), Entry.toast.success(Lang.Workspace.sound_remove_ok, b.name + " " + Lang.Workspace.sound_remove_ok_msg)) : Entry.toast.alert(Lang.Workspace.sound_remove_fail, "");
      Entry.removeElement(a);
    }}], "workspace-contextmenu");
  });
  var d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundOrder");
  a.orderHolder = d;
  a.appendChild(d);
  var c = Entry.createElement("div");
  c.addClass("entryPlaygroundSoundThumbnail");
  c.addClass("entryPlaygroundSoundPlay");
  var e = !1, f;
  c.addEventListener("click", function() {
    e ? (e = !1, c.removeClass("entryPlaygroundSoundStop"), c.addClass("entryPlaygroundSoundPlay"), f.stop()) : (e = !0, c.removeClass("entryPlaygroundSoundPlay"), c.addClass("entryPlaygroundSoundStop"), f = createjs.Sound.play(b.id), f.addEventListener("complete", function(a) {
      c.removeClass("entryPlaygroundSoundStop");
      c.addClass("entryPlaygroundSoundPlay");
      e = !1;
    }), f.addEventListener("loop", function(a) {
    }), f.addEventListener("failed", function(a) {
    }));
  });
  a.appendChild(c);
  var g = Entry.createElement("input");
  g.addClass("entryPlaygroundSoundName");
  g.sound = b;
  g.value = b.name;
  var h = document.getElementsByClassName("entryPlaygroundSoundName");
  g.onblur = function() {
    if ("" === this.value) {
      alert("\uc774\ub984\uc744 \uc785\ub825\ud558\uc5ec \uc8fc\uc138\uc694."), this.focus();
    } else {
      for (var a = 0, b = 0;b < h.length;b++) {
        if (h[b].value == g.value && (a += 1, 1 < a)) {
          alert("\uc774\ub984\uc774 \uc911\ubcf5 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
          this.focus();
          return;
        }
      }
      this.sound.name = this.value;
    }
  };
  g.onkeypress = function(a) {
    13 == a.keyCode && this.blur();
  };
  a.appendChild(g);
  d = Entry.createElement("div");
  d.addClass("entryPlaygroundSoundLength");
  d.innerHTML = b.duration + " \ucd08";
  a.appendChild(d);
};
Entry.Playground.prototype.toggleColourChooser = function(b) {
  "foreground" === b ? "none" === this.coloursWrapper.style.display ? (this.coloursWrapper.style.display = "block", this.backgroundsWrapper.style.display = "none") : this.coloursWrapper.style.display = "none" : "background" === b && ("none" === this.backgroundsWrapper.style.display ? (this.backgroundsWrapper.style.display = "block", this.coloursWrapper.style.display = "none") : this.backgroundsWrapper.style.display = "none");
};
Entry.Playground.prototype.setTextColour = function(b) {
  Entry.playground.object.entity.setColour(b);
  Entry.playground.toggleColourChooser("foreground");
  $(".entryPlayground_fgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.setBackgroundColour = function(b) {
  Entry.playground.object.entity.setBGColour(b);
  Entry.playground.toggleColourChooser("background");
  $(".entryPlayground_bgColorDiv").css("backgroundColor", b);
};
Entry.Playground.prototype.isTextBGMode = function() {
  return this.isTextBGMode_;
};
Entry.Playground.prototype.checkVariables = function() {
  Entry.forEBS || (Entry.variableContainer.lists_.length ? this.blockMenu.unbanClass("listNotExist") : this.blockMenu.banClass("listNotExist"), Entry.variableContainer.variables_.length ? this.blockMenu.unbanClass("variableNotExist") : this.blockMenu.banClass("variableNotExist"));
};
Entry.Playground.prototype.getViewMode = function() {
  return this.viewMode_;
};
Entry.Playground.prototype.updateHW = function() {
  var b = Entry.playground, a = b.mainWorkspace.blockMenu;
  if (a) {
    var d = Entry.hw;
    d && d.connected ? (a.unbanClass("arduinoConnected"), a.banClass("arduinoDisconnected"), d.banHW(), d.hwModule && a.unbanClass(d.hwModule.name)) : (a.banClass("arduinoConnected"), a.unbanClass("arduinoDisconnected"), Entry.hw.banHW());
    b.object && a.reDraw();
  }
};
Entry.Playground.prototype.toggleLineBreak = function(b) {
  this.object && "textBox" == this.object.objectType && (b ? (Entry.playground.object.entity.setLineBreak(!0), $(".entryPlayground_textArea").css("display", "block"), $(".entryPlayground_textBox").css("display", "none"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-false.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-true.png", this.fontSizeWrapper.removeClass("entryHide")) : (Entry.playground.object.entity.setLineBreak(!1), $(".entryPlayground_textArea").css("display", 
  "none"), $(".entryPlayground_textBox").css("display", "block"), this.linebreakOffImage.src = Entry.mediaFilePath + "text-linebreak-off-true.png", this.linebreakOnImage.src = Entry.mediaFilePath + "text-linebreak-on-false.png", this.fontSizeWrapper.addClass("entryHide")));
};
Entry.Playground.prototype.setFontAlign = function(b) {
  if ("textBox" == this.object.objectType) {
    this.alignLeftBtn.removeClass("toggle");
    this.alignCenterBtn.removeClass("toggle");
    this.alignRightBtn.removeClass("toggle");
    switch(b) {
      case Entry.TEXT_ALIGN_LEFT:
        this.alignLeftBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_CENTER:
        this.alignCenterBtn.addClass("toggle");
        break;
      case Entry.TEXT_ALIGN_RIGHT:
        this.alignRightBtn.addClass("toggle");
    }
    this.object.entity.setTextAlign(b);
  }
};
Entry.Playground.prototype.hideBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().hide();
};
Entry.Playground.prototype.showBlockMenu = function() {
  this.mainWorkspace.getBlockMenu().show();
};
Entry.Xml = {};
Entry.Xml.isTypeOf = function(b, a) {
  return a.getAttribute("type") == b;
};
Entry.Xml.getNextBlock = function(b) {
  b = b.childNodes;
  for (var a = 0;a < b.length;a++) {
    if ("NEXT" == b[a].tagName.toUpperCase()) {
      return b[a].children[0];
    }
  }
  return null;
};
Entry.Xml.getStatementBlock = function(b, a) {
  var d = a.getElementsByTagName("statement");
  if (!d.length) {
    return a;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == b) {
      return d[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getParentLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && "STATEMENT" == b.tagName.toUpperCase()) {
      return b.parentNode;
    }
    if (b) {
      b = b.parentNode;
    } else {
      return null;
    }
  }
};
Entry.Xml.getParentIterateLoop = function(b) {
  for (;;) {
    if (!b) {
      return null;
    }
    if ((b = b.parentNode) && b.getAttribute("type") && "REPEAT" == b.getAttribute("type").toUpperCase().substr(0, 6)) {
      return b;
    }
    if (!b) {
      return null;
    }
  }
};
Entry.Xml.getParentBlock = function(b) {
  return (b = b.parentNode) ? b.parentNode : null;
};
Entry.Xml.callReturn = function(b) {
  var a = Entry.Xml.getNextBlock(b);
  return a ? a : Entry.Xml.getParentLoop(b);
};
Entry.Xml.isRootBlock = function(b) {
};
Entry.Xml.getValue = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if ("VALUE" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return d[c].children[0];
    }
  }
  return null;
};
Entry.Xml.getNumberValue = function(b, a, d) {
  d = d.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].tagName && "VALUE" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == a) {
      return Number(Entry.Xml.operate(b, d[c].children[0]));
    }
  }
  return null;
};
Entry.Xml.getField = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].tagName && "FIELD" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return d[c].textContent;
    }
  }
};
Entry.Xml.getNumberField = function(b, a) {
  var d = a.childNodes;
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if ("FIELD" == d[c].tagName.toUpperCase() && d[c].getAttribute("name") == b) {
      return Number(d[c].textContent);
    }
  }
};
Entry.Xml.getBooleanValue = function(b, a, d) {
  d = d.getElementsByTagName("value");
  if (!d.length) {
    return null;
  }
  for (var c in d) {
    if (d[c].getAttribute("name") == a) {
      return Entry.Xml.operate(b, d[c].children[0]);
    }
  }
  return null;
};
Entry.Xml.operate = function(b, a) {
  return Entry.block[a.getAttribute("type")](b, a);
};
Entry.Xml.cloneBlock = function(b, a, d) {
  var c = b.cloneNode();
  b.parentNode && "xml" != b.parentNode.tagName && Entry.Xml.cloneBlock(b.parentNode, c, "parent");
  for (var e = 0;e < b.childNodes.length;e++) {
    var f = b.childNodes[e];
    f instanceof Text ? c.textContent = f.textContent : "parent" == d ? c.appendChild(a) : c.appendChild(Entry.Xml.cloneBlock(f, c, "child"));
  }
  return c;
};
Entry.Youtube = function(b) {
  this.generateView(b);
};
p = Entry.Youtube.prototype;
p.init = function(b) {
  this.youtubeHash = b;
  this.generateView();
};
p.generateView = function(b) {
  var a = Entry.createElement("div");
  a.addClass("entryContainerMovieWorkspace");
  a.addClass("entryHidden");
  this.movieContainer = a;
  a = Entry.createElement("iframe");
  a.setAttribute("id", "youtubeIframe");
  a.setAttribute("allowfullscreen", "");
  a.setAttribute("frameborder", 0);
  a.setAttribute("src", "https://www.youtube.com/embed/" + b);
  this.movieFrame = a;
  this.movieContainer.appendChild(a);
};
p.getView = function() {
  return this.movieContainer;
};
p.resize = function() {
  var b = document.getElementById("entryContainerWorkspaceId"), a = document.getElementById("youtubeIframe");
  w = b.offsetWidth;
  a.width = w + "px";
  a.height = 9 * w / 16 + "px";
};

