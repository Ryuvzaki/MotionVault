// ============================================
// MotionVault by Ryuvzaki — v3.0
// After Effects Dockable Panel Script
// Install: Copy to ScriptUI Panels folder
// ============================================

(function MotionVault(thisObj) {

    var CURRENT_VERSION = "3.0";
    var GITHUB_USERNAME = "Ryuvzaki";
    var VERSION_URL = "https://raw.githubusercontent.com/" + GITHUB_USERNAME + "/MotionVault/main/version.json";

    // ---- DATA ----
    var builtinExpressions = [
        // Motion
        { cat: "Motion", name: "Wiggle", code: "wiggle(3, 15)", desc: "Shaky random motion", prop: "Position", tutorial: "https://www.youtube.com/results?search_query=after+effects+wiggle+expression" },
        { cat: "Motion", name: "Loop Cycle", code: 'loopOut("cycle")', desc: "Loop animation infinitely", prop: "Position", tutorial: "" },
        { cat: "Motion", name: "Ping Pong", code: 'loopOut("pingpong")', desc: "Loop back and forth", prop: "Position", tutorial: "" },
        { cat: "Motion", name: "Sine Wave", code: "[value[0] + Math.sin(time * 2) * 50, value[1]]", desc: "Smooth wave motion", prop: "Position", tutorial: "" },
        { cat: "Motion", name: "Orbital", code: "[thisComp.width/2 + Math.sin(time)*80, thisComp.height/2 + Math.cos(time)*80]", desc: "Circular orbital motion", prop: "Position", tutorial: "" },
        { cat: "Motion", name: "Continuous Rotation", code: "time * 90", desc: "Spin forever (90 deg/s)", prop: "Rotation", tutorial: "" },
        { cat: "Motion", name: "Wiggle Rotation", code: "wiggle(2, 30)", desc: "Random rotation shake", prop: "Rotation", tutorial: "" },
        { cat: "Motion", name: "Bounce", code: "amp=0.1; freq=2; decay=4; n=0; if(numKeys>0){n=nearestKey(time).index; if(key(n).time>time)n--;} if(n>0){t=time-key(n).time; v=velocityAtTime(key(n).time-0.001)*amp; value+v*Math.sin(freq*2*Math.PI*t)/Math.exp(decay*t);}else value", desc: "Realistic bounce after keyframe", prop: "Position", tutorial: "" },

        // Time
        { cat: "Time", name: "Posterize Time", code: "posterizeTime(12); value", desc: "Reduce to 12fps", prop: "Position", tutorial: "" },
        { cat: "Time", name: "Blink", code: "(time % 1 < 0.5) ? 100 : 0", desc: "Blinking opacity (1s)", prop: "Opacity", tutorial: "" },
        { cat: "Time", name: "Delay Trail", code: "try { thisComp.layer(index-1).transform.position.valueAtTime(time - 0.1) } catch(e) { value }", desc: "Follow previous layer with delay", prop: "Position", tutorial: "" },
        { cat: "Time", name: "Time Remap Loop", code: "footage = thisComp.layer(index).source; loop = footage.duration; time % loop", desc: "Loop time remap", prop: "Position", tutorial: "" },

        // Text
        { cat: "Text", name: "Linear Count", code: "linear(time, 0, 3, 0, 100).toFixed(0)", desc: "Count 0 to 100 in 3s", prop: "Source Text", tutorial: "" },
        { cat: "Text", name: "Random Integer", code: "Math.floor(wiggle(1,50)[0] + 50)", desc: "Random number 0-100", prop: "Source Text", tutorial: "" },
        { cat: "Text", name: "Stopwatch", code: "timeToCurrentFormat()", desc: "Show current time", prop: "Source Text", tutorial: "" },
        { cat: "Text", name: "Typewriter", code: "n = Math.floor(time * 10); text.sourceText.substring(0, n)", desc: "Typewriter reveal effect", prop: "Source Text", tutorial: "" },

        // Opacity
        { cat: "Opacity", name: "Fade In", code: "linear(time, inPoint, inPoint + 0.5, 0, 100)", desc: "Fade in on layer start", prop: "Opacity", tutorial: "" },
        { cat: "Opacity", name: "Fade Out", code: "linear(time, outPoint - 0.5, outPoint, 100, 0)", desc: "Fade out on layer end", prop: "Opacity", tutorial: "" },
        { cat: "Opacity", name: "Pulse", code: "(Math.sin(time * 4) + 1) / 2 * 100", desc: "Pulsing opacity", prop: "Opacity", tutorial: "" },
        { cat: "Opacity", name: "Fade In Out", code: "t1=inPoint+0.3; t2=outPoint-0.3; if(time<t1) linear(time,inPoint,t1,0,100) else if(time>t2) linear(time,t2,outPoint,100,0) else 100", desc: "Auto fade in and out", prop: "Opacity", tutorial: "" },

        // Scale
        { cat: "Scale", name: "Breathe", code: "s = Math.sin(time * 2) * 5 + 100; [s, s]", desc: "Gentle breathing scale", prop: "Scale", tutorial: "" },
        { cat: "Scale", name: "Wiggle Scale", code: "wiggle(2, 10)", desc: "Random scale shake", prop: "Scale", tutorial: "" },
        { cat: "Scale", name: "Loop Scale", code: 'loopOut("cycle")', desc: "Loop scale animation", prop: "Scale", tutorial: "" },
        { cat: "Scale", name: "Pop In", code: "linear(time, inPoint, inPoint+0.2, 0, 100)", desc: "Quick pop in scale", prop: "Scale", tutorial: "" },

        // Control
        { cat: "Control", name: "Slider Link", code: 'thisComp.layer("Control").effect("Slider")("Slider")', desc: "Link to slider control", prop: "Opacity", tutorial: "" },
        { cat: "Control", name: "Color Control", code: 'thisComp.layer("Control").effect("Color Control")("Color")', desc: "Link to color control", prop: "Opacity", tutorial: "" },
        { cat: "Control", name: "Checkbox Toggle", code: 'thisComp.layer("Control").effect("Checkbox Control")("Checkbox") ? 100 : 0', desc: "Toggle with checkbox", prop: "Opacity", tutorial: "" },
        { cat: "Control", name: "Point Control Link", code: 'thisComp.layer("Control").effect("Point Control")("Point")', desc: "Link to point control", prop: "Position", tutorial: "" },

        // Camera
        { cat: "Camera", name: "Auto Orient", code: "lookAt(thisLayer.position, thisComp.layer('Camera 1').position)", desc: "Always face the camera", prop: "Orientation", tutorial: "" },
        { cat: "Camera", name: "Depth Scale", code: "s = 1000 / (1000 - position[2]); [s, s]", desc: "Scale based on Z depth", prop: "Scale", tutorial: "" },
        { cat: "Camera", name: "Camera Shake", code: "wiggle(8, 15)", desc: "Handheld camera shake", prop: "Position", tutorial: "" },
        { cat: "Camera", name: "Parallax", code: "[value[0] + thisComp.layer('Camera 1').transform.position[0] * -0.1, value[1]]", desc: "Parallax with camera", prop: "Position", tutorial: "" },
    ];

    var propNames = ["Position", "Rotation", "Opacity", "Scale", "Source Text", "Orientation"];
    var cats = ["All", "Last Used", "Favorites", "Motion", "Time", "Text", "Opacity", "Scale", "Control", "Camera", "My Expressions"];
    var catEmoji = { "All": "ALL", "Last Used": "RECENT", "Favorites": "FAV", "Motion": "MOT", "Time": "TIME", "Text": "TXT", "Opacity": "OPC", "Scale": "SCL", "Control": "CTRL", "Camera": "CAM", "My Expressions": "MY" };

    var propMap = {
        "Position":    function(l) { return l.property("Transform").property("Position"); },
        "Rotation":    function(l) { return l.property("Transform").property("Rotation"); },
        "Opacity":     function(l) { return l.property("Transform").property("Opacity"); },
        "Scale":       function(l) { return l.property("Transform").property("Scale"); },
        "Orientation": function(l) { return l.property("Transform").property("Orientation"); },
        "Source Text": function(l) { return l.property("Source Text"); },
    };

    // ---- SETTINGS / STORAGE ----
    var favorites = {};
    var lastUsed = [];
    var usageStats = {};
    var customExprs = [];
    var expressionHistory = [];
    var lastSeenVersion = "";

    function loadSettings() {
        try {
            if (app.settings.haveSetting("MotionVault", "favorites"))
                favorites = eval("(" + app.settings.getSetting("MotionVault", "favorites") + ")");
        } catch(e) { favorites = {}; }
        try {
            if (app.settings.haveSetting("MotionVault", "lastUsed"))
                lastUsed = eval("(" + app.settings.getSetting("MotionVault", "lastUsed") + ")");
        } catch(e) { lastUsed = []; }
        try {
            if (app.settings.haveSetting("MotionVault", "usageStats"))
                usageStats = eval("(" + app.settings.getSetting("MotionVault", "usageStats") + ")");
        } catch(e) { usageStats = {}; }
        try {
            if (app.settings.haveSetting("MotionVault", "customExprs")) {
                var raw = app.settings.getSetting("MotionVault", "customExprs");
                customExprs = eval("(" + raw + ")");
            }
        } catch(e) { customExprs = []; }
        try {
            if (app.settings.haveSetting("MotionVault", "exprHistory"))
                expressionHistory = eval("(" + app.settings.getSetting("MotionVault", "exprHistory") + ")");
        } catch(e) { expressionHistory = []; }
        try {
            if (app.settings.haveSetting("MotionVault", "lastSeenVersion"))
                lastSeenVersion = app.settings.getSetting("MotionVault", "lastSeenVersion");
        } catch(e) { lastSeenVersion = ""; }
    }

    function saveFavorites() {
        try {
            var arr = [];
            for (var k in favorites) arr.push('"' + k + '":true');
            app.settings.saveSetting("MotionVault", "favorites", "{" + arr.join(",") + "}");
        } catch(e) {}
    }
    function saveLastUsed() {
        try { app.settings.saveSetting("MotionVault", "lastUsed", JSON.stringify ? JSON.stringify(lastUsed) : ("" + lastUsed)); } catch(e) {}
    }
    function saveUsageStats() {
        try {
            var arr = [];
            for (var k in usageStats) arr.push('"' + k + '":' + usageStats[k]);
            app.settings.saveSetting("MotionVault", "usageStats", "{" + arr.join(",") + "}");
        } catch(e) {}
    }
    function saveCustomExprs() {
        try {
            var arr = [];
            for (var i = 0; i < customExprs.length; i++) {
                var e = customExprs[i];
                arr.push('{cat:"My Expressions",name:"' + e.name.replace(/"/g,'\\"') + '",code:"' + e.code.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n') + '",desc:"' + e.desc.replace(/"/g,'\\"') + '",prop:"' + e.prop + '",tutorial:""}');
            }
            app.settings.saveSetting("MotionVault", "customExprs", "[" + arr.join(",") + "]");
        } catch(e) {}
    }
    function saveHistory() {
        try {
            var arr = [];
            for (var i = 0; i < expressionHistory.length; i++) {
                var e = expressionHistory[i];
                arr.push('{name:"' + e.name.replace(/"/g,'\\"') + '",code:"' + e.code.replace(/\\/g,'\\\\').replace(/"/g,'\\"') + '",prop:"' + e.prop + '"}');
            }
            app.settings.saveSetting("MotionVault", "exprHistory", "[" + arr.join(",") + "]");
        } catch(e) {}
    }

    function addToHistory(expr) {
        // Remove if already exists
        for (var i = expressionHistory.length - 1; i >= 0; i--) {
            if (expressionHistory[i].name === expr.name) expressionHistory.splice(i, 1);
        }
        expressionHistory.unshift({ name: expr.name, code: expr.code, prop: expr.prop, cat: expr.cat, desc: expr.desc, tutorial: expr.tutorial || "" });
        if (expressionHistory.length > 10) expressionHistory.pop();
        saveHistory();
    }

    function addToLastUsed(name) {
        for (var i = lastUsed.length - 1; i >= 0; i--) {
            if (lastUsed[i] === name) lastUsed.splice(i, 1);
        }
        lastUsed.unshift(name);
        if (lastUsed.length > 5) lastUsed.pop();
        saveLastUsed();
        usageStats[name] = (usageStats[name] || 0) + 1;
        saveUsageStats();
    }

    function getAllExprs() {
        var all = [];
        for (var i = 0; i < builtinExpressions.length; i++) all.push(builtinExpressions[i]);
        for (var j = 0; j < customExprs.length; j++) all.push(customExprs[j]);
        return all;
    }

    function exportExpressions() {
        try {
            var f = File.saveDialog("Export expressions as JSON", "JSON files:*.json");
            if (!f) return;
            f.open("w");
            var arr = [];
            for (var i = 0; i < customExprs.length; i++) {
                var e = customExprs[i];
                arr.push('{"name":"' + e.name.replace(/"/g,'\\"') + '","code":"' + e.code.replace(/\\/g,'\\\\').replace(/"/g,'\\"') + '","desc":"' + e.desc.replace(/"/g,'\\"') + '","prop":"' + e.prop + '"}');
            }
            f.write("[" + arr.join(",") + "]");
            f.close();
            alert("Exported " + customExprs.length + " custom expressions!");
        } catch(err) { alert("Export failed: " + err.toString()); }
    }

    function importExpressions() {
        try {
            var f = File.openDialog("Import expressions from JSON", "JSON files:*.json");
            if (!f) return;
            f.open("r");
            var content = f.read();
            f.close();
            var jsonStart = content.indexOf("[");
            if (jsonStart === -1) { alert("Invalid file format!"); return; }
            var data = eval("(" + content.substring(jsonStart) + ")");
            var added = 0;
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (d.name && d.code) {
                    customExprs.push({ cat: "My Expressions", name: d.name, code: d.code, desc: d.desc || "", prop: d.prop || "Position", tutorial: "" });
                    added++;
                }
            }
            saveCustomExprs();
            alert("Imported " + added + " expressions!");
        } catch(err) { alert("Import failed: " + err.toString()); }
    }

    // ---- UI ----
    loadSettings();

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "MotionVault v" + CURRENT_VERSION + "  |  by Ryuvzaki", undefined, { resizeable: true });

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 4;
        win.margins = 8;

        // Header
        var headerGroup = win.add("group");
        headerGroup.orientation = "row";
        headerGroup.alignChildren = ["fill", "center"];
        headerGroup.spacing = 4;

        var titleGroup = headerGroup.add("group");
        titleGroup.orientation = "column";
        titleGroup.alignChildren = ["left", "center"];
        titleGroup.spacing = 0;
        var titleText = titleGroup.add("statictext", undefined, "MotionVault");
        var subText = titleGroup.add("statictext", undefined, "by Ryuvzaki  |  v" + CURRENT_VERSION);

        var updateBtn = headerGroup.add("button", undefined, "Check Update");
        updateBtn.preferredSize.width = 95;

        // Stats row
        var statsGroup = win.add("group");
        statsGroup.orientation = "row";
        statsGroup.alignChildren = ["fill", "center"];
        var statsText = statsGroup.add("statictext", undefined, "");
        statsText.alignment = ["fill", "center"];

        function updateStats() {
            var total = builtinExpressions.length + customExprs.length;
            var favCount = 0;
            for (var k in favorites) if (favorites[k]) favCount++;
            statsText.text = total + " expressions  |  " + favCount + " favorites  |  " + customExprs.length + " custom";
        }
        updateStats();

        // Search
        var searchGroup = win.add("group");
        searchGroup.orientation = "row";
        searchGroup.alignChildren = ["fill", "center"];
        searchGroup.add("statictext", undefined, "Search:").preferredSize.width = 45;
        var searchInput = searchGroup.add("edittext", undefined, "");
        searchInput.preferredSize.width = 180;
        var clearBtn = searchGroup.add("button", undefined, "X");
        clearBtn.preferredSize.width = 24;

        // Category
        var catGroup = win.add("group");
        catGroup.orientation = "row";
        catGroup.alignChildren = ["left", "center"];
        catGroup.add("statictext", undefined, "Category:").preferredSize.width = 58;
        var catDropdown = catGroup.add("dropdownlist", undefined, cats);
        catDropdown.selection = 0;
        catDropdown.preferredSize.width = 145;
        var surpriseBtn = catGroup.add("button", undefined, "!");
        surpriseBtn.preferredSize.width = 24;
        surpriseBtn.helpTip = "Surprise me!";

        // List
        var listBox = win.add("listbox", undefined, [], {
            numberOfColumns: 4,
            showHeaders: true,
            columnTitles: ["Name", "Prop", "Uses", "Description"],
            columnWidths: [110, 65, 35, 155]
        });
        listBox.preferredSize.height = 170;

        // Preview
        var previewPanel = win.add("panel", undefined, "Expression Code:");
        previewPanel.orientation = "column";
        previewPanel.alignChildren = ["fill", "top"];
        previewPanel.margins = 6;
        var previewText = previewPanel.add("edittext", undefined, "", { multiline: true, readonly: false });
        previewText.preferredSize.height = 48;

        // Tutorial link
        var tutorialGroup = win.add("group");
        tutorialGroup.orientation = "row";
        tutorialGroup.alignChildren = ["left", "center"];
        var tutorialBtn = tutorialGroup.add("button", undefined, "Watch Tutorial");
        tutorialBtn.preferredSize.width = 105;
        tutorialBtn.enabled = false;
        var favBtn = tutorialGroup.add("button", undefined, "* Favorite");
        favBtn.preferredSize.width = 85;
        var historyBtn = tutorialGroup.add("button", undefined, "History");
        historyBtn.preferredSize.width = 65;

        // Property + apply
        var propGroup = win.add("group");
        propGroup.orientation = "row";
        propGroup.alignChildren = ["left", "center"];
        propGroup.add("statictext", undefined, "Apply to:").preferredSize.width = 52;
        var propDropdown = propGroup.add("dropdownlist", undefined, propNames);
        propDropdown.selection = 0;
        propDropdown.preferredSize.width = 110;
        var multiPropCheck = propGroup.add("checkbox", undefined, "Multi-prop");

        // Main buttons
        var btnGroup = win.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignChildren = ["center", "center"];
        btnGroup.spacing = 4;
        var copyBtn = btnGroup.add("button", undefined, "Copy Code");
        copyBtn.preferredSize.width = 85;
        var applyBtn = btnGroup.add("button", undefined, "Apply to Layer");
        applyBtn.preferredSize.width = 105;
        var removeBtn = btnGroup.add("button", undefined, "Remove Expr");
        removeBtn.preferredSize.width = 95;
        var testBtn = btnGroup.add("button", undefined, "Test");
        testBtn.preferredSize.width = 50;

        // Custom expression buttons
        var customGroup = win.add("group");
        customGroup.orientation = "row";
        customGroup.alignChildren = ["center", "center"];
        customGroup.spacing = 4;
        var saveExprBtn = customGroup.add("button", undefined, "+ Save Custom");
        saveExprBtn.preferredSize.width = 100;
        var deleteExprBtn = customGroup.add("button", undefined, "- Delete");
        deleteExprBtn.preferredSize.width = 65;
        var exportBtn = customGroup.add("button", undefined, "Export");
        exportBtn.preferredSize.width = 60;
        var importBtn = customGroup.add("button", undefined, "Import");
        importBtn.preferredSize.width = 60;

        // Footer
        var footer = win.add("statictext", undefined, "MotionVault v" + CURRENT_VERSION + "  —  by Ryuvzaki");
        footer.justify = "center";

        // ---- LOGIC ----
        var currentTutorialUrl = "";

        function getFiltered() {
            var search = searchInput.text.toLowerCase();
            var cat = cats[catDropdown.selection.index];
            var all = getAllExprs();
            var result = [];

            if (cat === "Last Used") {
                for (var lu = 0; lu < lastUsed.length; lu++) {
                    for (var ai = 0; ai < all.length; ai++) {
                        if (all[ai].name === lastUsed[lu]) { result.push(all[ai]); break; }
                    }
                }
                return result;
            }
            if (cat === "Favorites") {
                for (var ai2 = 0; ai2 < all.length; ai2++) {
                    if (favorites[all[ai2].name]) result.push(all[ai2]);
                }
                return result;
            }

            for (var i = 0; i < all.length; i++) {
                var e = all[i];
                var matchCat = (cat === "All") || (e.cat === cat);
                var matchSearch = (search === "") ||
                    (e.name.toLowerCase().indexOf(search) !== -1) ||
                    (e.code.toLowerCase().indexOf(search) !== -1) ||
                    (e.desc.toLowerCase().indexOf(search) !== -1);
                if (matchCat && matchSearch) result.push(e);
            }
            return result;
        }

        function renderList() {
            listBox.removeAll();
            var filtered = getFiltered();
            for (var i = 0; i < filtered.length; i++) {
                var e = filtered[i];
                var isFav = favorites[e.name] ? "* " : "";
                var item = listBox.add("item", isFav + e.name);
                item.subItems[0].text = e.prop;
                item.subItems[1].text = (usageStats[e.name] || 0) + "x";
                item.subItems[2].text = e.desc;
            }
            updateStats();
        }

        function getSelectedExpr() {
            if (!listBox.selection) return null;
            return getFiltered()[listBox.selection.index];
        }

        function syncPropDropdown(e) {
            if (!e) return;
            for (var i = 0; i < propNames.length; i++) {
                if (propNames[i] === e.prop) { propDropdown.selection = i; break; }
            }
        }

        function updateFavBtn(e) {
            if (!e) { favBtn.text = "* Favorite"; return; }
            favBtn.text = favorites[e.name] ? "* Unfavorite" : "* Favorite";
        }

        listBox.onChange = function () {
            var e = getSelectedExpr();
            if (!e) return;
            previewText.text = e.code;
            syncPropDropdown(e);
            updateFavBtn(e);
            currentTutorialUrl = e.tutorial || "";
            tutorialBtn.enabled = (currentTutorialUrl !== "");
        };

        searchInput.onChanging = function () {
            if (searchInput.text !== "") catDropdown.selection = 0;
            renderList();
        };

        clearBtn.onClick = function () {
            searchInput.text = "";
            renderList();
        };

        catDropdown.onChange = function () { renderList(); };

        surpriseBtn.onClick = function () {
            var all = getAllExprs();
            if (all.length === 0) return;
            var rand = Math.floor(Math.random() * all.length);
            var e = all[rand];
            previewText.text = e.code;
            syncPropDropdown(e);
            updateFavBtn(e);
            currentTutorialUrl = e.tutorial || "";
            tutorialBtn.enabled = (currentTutorialUrl !== "");
            alert("Surprise!\n\n" + e.name + "\n" + e.desc);
        };

        tutorialBtn.onClick = function () {
            if (currentTutorialUrl !== "") {
                try { app.system('start "" "' + currentTutorialUrl + '"'); } catch(e) {}
            }
        };

        favBtn.onClick = function () {
            var e = getSelectedExpr();
            if (!e) { alert("Select an expression first!"); return; }
            if (favorites[e.name]) {
                delete favorites[e.name];
            } else {
                favorites[e.name] = true;
            }
            saveFavorites();
            updateFavBtn(e);
            renderList();
        };

        historyBtn.onClick = function () {
            if (expressionHistory.length === 0) { alert("No history yet!"); return; }
            var histWin = new Window("dialog", "Expression History");
            histWin.orientation = "column";
            histWin.alignChildren = ["fill", "top"];
            histWin.margins = 10;
            histWin.spacing = 6;
            histWin.add("statictext", undefined, "Last 10 used expressions:");
            var histList = histWin.add("listbox", undefined, [], {
                numberOfColumns: 2,
                showHeaders: true,
                columnTitles: ["Name", "Property"],
                columnWidths: [150, 100]
            });
            histList.preferredSize.height = 180;
            for (var i = 0; i < expressionHistory.length; i++) {
                var item = histList.add("item", expressionHistory[i].name);
                item.subItems[0].text = expressionHistory[i].prop;
            }
            var hBtns = histWin.add("group");
            hBtns.alignment = ["center", "center"];
            var useBtn = hBtns.add("button", undefined, "Use Selected");
            var closeHBtn = hBtns.add("button", undefined, "Close");
            useBtn.onClick = function () {
                if (!histList.selection) return;
                var h = expressionHistory[histList.selection.index];
                previewText.text = h.code;
                for (var i = 0; i < propNames.length; i++) {
                    if (propNames[i] === h.prop) { propDropdown.selection = i; break; }
                }
                histWin.close();
            };
            closeHBtn.onClick = function () { histWin.close(); };
            histWin.center();
            histWin.show();
        };

        copyBtn.onClick = function () {
            var code = previewText.text;
            if (!code) { alert("Select an expression first!"); return; }
            alert("Copy the code below:\n\n" + code);
        };

        applyBtn.onClick = function () {
            var code = previewText.text;
            if (!code) { alert("Select or write an expression first!"); return; }
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Please open a Composition first!"); return; }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) { alert("Please select a layer first!"); return; }

            var propsToApply = [];
            if (multiPropCheck.value) {
                // Apply to Position, Rotation, Scale, Opacity
                propsToApply = ["Position", "Rotation", "Opacity", "Scale"];
            } else {
                propsToApply = [propNames[propDropdown.selection.index]];
            }

            app.beginUndoGroup("MotionVault: Apply Expression");
            var success = 0;
            var fail = 0;
            for (var li = 0; li < selectedLayers.length; li++) {
                for (var pi = 0; pi < propsToApply.length; pi++) {
                    var getter = propMap[propsToApply[pi]];
                    if (!getter) continue;
                    try {
                        var prop = getter(selectedLayers[li]);
                        if (prop) { prop.expression = code; success++; }
                        else fail++;
                    } catch(err) { fail++; }
                }
            }
            app.endUndoGroup();

            // Track usage
            var e = getSelectedExpr();
            if (e) {
                addToLastUsed(e.name);
                addToHistory(e);
            }

            if (success > 0) {
                applyBtn.text = "✓ Applied!";
                var t = app.activeViewer;
                try {
                    var startT = new Date().getTime();
                    while(new Date().getTime() - startT < 800){}
                } catch(er){}
                applyBtn.text = "Apply to Layer";
                if (fail > 0) {
                    alert("Applied to " + success + " prop(s).\n" + fail + " failed (wrong layer type).");
                }
            } else {
                alert("Failed! Try changing the 'Apply to' dropdown.");
            }
            renderList();
        };

        removeBtn.onClick = function () {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Please open a Composition first!"); return; }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) { alert("Please select a layer first!"); return; }
            var propName = propNames[propDropdown.selection.index];
            var getter = propMap[propName];
            if (!getter) return;
            app.beginUndoGroup("MotionVault: Remove Expression");
            var success = 0;
            for (var i = 0; i < selectedLayers.length; i++) {
                try {
                    var prop = getter(selectedLayers[i]);
                    if (prop) { prop.expression = ""; success++; }
                } catch(err) {}
            }
            app.endUndoGroup();
            alert("Removed expression from " + success + " layer(s).");
        };

        testBtn.onClick = function () {
            var code = previewText.text;
            if (!code) { alert("Write or select an expression first!"); return; }
            try {
                var result = eval(code.replace(/thisComp/g, '""').replace(/time/g, '1').replace(/value/g, '0'));
                alert("Test result at time=1:\n\n" + result);
            } catch(err) {
                alert("Expression test:\n" + err.toString() + "\n\n(Note: Some expressions only work inside AE)");
            }
        };

        saveExprBtn.onClick = function () {
            var code = previewText.text;
            if (!code) { alert("Write or select an expression first!"); return; }
            var dlg = new Window("dialog", "Save Custom Expression");
            dlg.orientation = "column";
            dlg.alignChildren = ["fill", "top"];
            dlg.margins = 12;
            dlg.spacing = 6;
            dlg.add("statictext", undefined, "Name:");
            var nameIn = dlg.add("edittext", undefined, "My Expression");
            nameIn.preferredSize.width = 240;
            dlg.add("statictext", undefined, "Description:");
            var descIn = dlg.add("edittext", undefined, "Custom expression");
            descIn.preferredSize.width = 240;
            var dBtns = dlg.add("group");
            dBtns.alignment = ["center", "center"];
            var okB = dBtns.add("button", undefined, "Save");
            var cancelB = dBtns.add("button", undefined, "Cancel");
            okB.onClick = function () {
                var propName = propNames[propDropdown.selection.index];
                customExprs.push({ cat: "My Expressions", name: nameIn.text, code: code, desc: descIn.text, prop: propName, tutorial: "" });
                saveCustomExprs();
                updateStats();
                renderList();
                dlg.close();
                alert("Saved: " + nameIn.text);
            };
            cancelB.onClick = function () { dlg.close(); };
            dlg.center();
            dlg.show();
        };

        deleteExprBtn.onClick = function () {
            var e = getSelectedExpr();
            if (!e || e.cat !== "My Expressions") { alert("Select a custom expression from 'My Expressions' first!"); return; }
            for (var i = 0; i < customExprs.length; i++) {
                if (customExprs[i].name === e.name) { customExprs.splice(i, 1); break; }
            }
            saveCustomExprs();
            updateStats();
            renderList();
            alert("Deleted!");
        };

        exportBtn.onClick = function () { exportExpressions(); };
        importBtn.onClick = function () { importExpressions(); updateStats(); renderList(); };

        // Auto-Update check
        updateBtn.onClick = function () {
            try {
                var tmpFile = new File(Folder.temp.absoluteURI + "/mv_version.json");
                var url = "https://raw.githubusercontent.com/" + GITHUB_USERNAME + "/MotionVault/main/version.json";
                var cmd = "";
                if ($.os.indexOf("Windows") !== -1) {
                    cmd = 'curl -s -o "' + tmpFile.fsName + '" "' + url + '"';
                } else {
                    cmd = 'curl -s -o "' + tmpFile.absoluteURI + '" "' + url + '"';
                }
                app.system(cmd);
                var startTime = new Date().getTime();
                while (new Date().getTime() - startTime < 2000) {}
                if (tmpFile.exists) {
                    tmpFile.open("r");
                    var content = tmpFile.read();
                    tmpFile.close();
                    tmpFile.remove();
                    var jsonStart = content.indexOf("{");
                    if (jsonStart !== -1) {
                        var data = eval("(" + content.substring(jsonStart) + ")");
                        if (data.version && data.version !== CURRENT_VERSION) {
                            var msg = "New version available!\n\nCurrent: v" + CURRENT_VERSION + "\nLatest: v" + data.version + "\n\n";
                            if (data.changelog) msg += "What's new:\n" + data.changelog + "\n\n";
                            msg += "Download from where you purchased MotionVault.";
                            alert(msg);
                        } else {
                            alert("You are on the latest version (v" + CURRENT_VERSION + ")!");
                        }
                    } else {
                        alert("Could not parse update info.\nCheck: github.com/" + GITHUB_USERNAME + "/MotionVault");
                    }
                } else {
                    alert("Could not check for updates.\nCheck: github.com/" + GITHUB_USERNAME + "/MotionVault");
                }
            } catch(err) {
                alert("Update check failed: " + err.toString());
            }
        };

        // Onboarding
        try {
            if (!app.settings.haveSetting("MotionVault", "onboarded_v3")) {
                app.settings.saveSetting("MotionVault", "onboarded_v3", "true");
                var welcome = new Window("dialog", "Welcome to MotionVault v3.0!");
                welcome.orientation = "column";
                welcome.alignChildren = ["fill", "top"];
                welcome.margins = 16;
                welcome.spacing = 6;
                welcome.add("statictext", undefined, "Welcome to MotionVault v3.0 by Ryuvzaki!");
                welcome.add("statictext", undefined, " ");
                welcome.add("statictext", undefined, "What's new in v3.0:");
                var news = [
                    "- Favorites system",
                    "- Last Used & Usage statistics",
                    "- Expression History (last 10)",
                    "- Multi-property apply",
                    "- Export / Import custom expressions",
                    "- Surprise Me button (!)",
                    "- Expression tester",
                    "- Tutorial links per expression",
                    "- Many more expressions added"
                ];
                for (var s = 0; s < news.length; s++) welcome.add("statictext", undefined, news[s]);
                welcome.add("statictext", undefined, " ");
                welcome.add("statictext", undefined, "How to use:");
                var steps = ["1. Search or browse by category", "2. Select expression", "3. Select layer in timeline", "4. Choose property & click Apply"];
                for (var st = 0; st < steps.length; st++) welcome.add("statictext", undefined, steps[st]);
                welcome.add("statictext", undefined, " ");
                var startBtn = welcome.add("button", undefined, "Let's Go!");
                startBtn.alignment = ["center", "center"];
                startBtn.onClick = function () { welcome.close(); };
                welcome.center();
                welcome.show();
            }
        } catch(e) {}

        // Changelog on version change
        try {
            if (lastSeenVersion !== "" && lastSeenVersion !== CURRENT_VERSION) {
                app.settings.saveSetting("MotionVault", "lastSeenVersion", CURRENT_VERSION);
                alert("MotionVault updated to v" + CURRENT_VERSION + "!\n\nWhat's new:\n- Favorites, History, Stats\n- Multi-prop apply\n- Export/Import\n- Surprise Me!\n- Expression tester\n- 10+ new expressions");
            } else {
                app.settings.saveSetting("MotionVault", "lastSeenVersion", CURRENT_VERSION);
            }
        } catch(e) {}

        renderList();

        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }

        return win;
    }

    buildUI(thisObj);

}(this));
