// ============================================
// MotionVault by Ryuvzaki
// After Effects Dockable Panel Script v2.0
// Install: Copy to ScriptUI Panels folder
// ============================================

(function MotionVault(thisObj) {

    var CURRENT_VERSION = "2.0";
    var GITHUB_USERNAME = "Ryuvzaki"; // <-- shu yerni o'zgartiring
    var VERSION_URL = "https://raw.githubusercontent.com/" + GITHUB_USERNAME + "/MotionVault/main/version.json";

    var expressions = [
        // Motion
        { cat: "Motion", name: "Wiggle", code: "wiggle(3, 15)", desc: "Shaky random motion", prop: "Position" },
        { cat: "Motion", name: "Loop Cycle", code: 'loopOut("cycle")', desc: "Loop animation infinitely", prop: "Position" },
        { cat: "Motion", name: "Ping Pong", code: 'loopOut("pingpong")', desc: "Loop back and forth", prop: "Position" },
        { cat: "Motion", name: "Sine Wave", code: "[value[0] + Math.sin(time * 2) * 50, value[1]]", desc: "Smooth wave motion", prop: "Position" },
        { cat: "Motion", name: "Orbital", code: "[thisComp.width/2 + Math.sin(time)*80, thisComp.height/2 + Math.cos(time)*80]", desc: "Circular orbital motion", prop: "Position" },
        { cat: "Motion", name: "Continuous Rotation", code: "time * 90", desc: "Spin forever (90 deg/s)", prop: "Rotation" },
        { cat: "Motion", name: "Wiggle Rotation", code: "wiggle(2, 30)", desc: "Random rotation shake", prop: "Rotation" },

        // Time
        { cat: "Time", name: "Posterize Time", code: "posterizeTime(12)", desc: "Reduce to 12fps", prop: "Position" },
        { cat: "Time", name: "Blink", code: "(time % 1 < 0.5) ? 100 : 0", desc: "Blinking opacity (1s)", prop: "Opacity" },
        { cat: "Time", name: "Delay Trail", code: "try { thisComp.layer(index-1).transform.position.valueAtTime(time - 0.1) } catch(e) { value }", desc: "Follow previous layer with delay", prop: "Position" },

        // Text
        { cat: "Text", name: "Linear Count", code: "linear(time, 0, 3, 0, 100).toFixed(0)", desc: "Count 0 to 100 in 3s", prop: "Source Text" },
        { cat: "Text", name: "Random Integer", code: "Math.floor(wiggle(1,50)[0] + 50)", desc: "Random number 0-100", prop: "Source Text" },
        { cat: "Text", name: "Stopwatch", code: "timeToCurrentFormat()", desc: "Show current time", prop: "Source Text" },

        // Opacity
        { cat: "Opacity", name: "Fade In", code: "linear(time, inPoint, inPoint + 0.5, 0, 100)", desc: "Fade in on layer start", prop: "Opacity" },
        { cat: "Opacity", name: "Fade Out", code: "linear(time, outPoint - 0.5, outPoint, 100, 0)", desc: "Fade out on layer end", prop: "Opacity" },
        { cat: "Opacity", name: "Pulse", code: "(Math.sin(time * 4) + 1) / 2 * 100", desc: "Pulsing opacity", prop: "Opacity" },

        // Scale
        { cat: "Scale", name: "Breathe", code: "s = Math.sin(time * 2) * 5 + 100; [s, s]", desc: "Gentle breathing scale", prop: "Scale" },
        { cat: "Scale", name: "Wiggle Scale", code: "wiggle(2, 10)", desc: "Random scale shake", prop: "Scale" },
        { cat: "Scale", name: "Loop Scale", code: 'loopOut("cycle")', desc: "Loop scale animation", prop: "Scale" },

        // Control
        { cat: "Control", name: "Slider Link", code: 'thisComp.layer("Control").effect("Slider")("Slider")', desc: "Link to slider control", prop: "Opacity" },
        { cat: "Control", name: "Color Control", code: 'thisComp.layer("Control").effect("Color Control")("Color")', desc: "Link to color control", prop: "Opacity" },
        { cat: "Control", name: "Checkbox Toggle", code: 'thisComp.layer("Control").effect("Checkbox Control")("Checkbox") ? 100 : 0', desc: "Toggle with checkbox", prop: "Opacity" },

        // Camera
        { cat: "Camera", name: "Auto Orient", code: "lookAt(thisLayer.position, thisComp.layer('Camera 1').position)", desc: "Always face the camera", prop: "Orientation" },
        { cat: "Camera", name: "Depth Scale", code: "s = 1000 / (1000 - position[2]); [s, s]", desc: "Scale based on Z depth", prop: "Scale" },
        { cat: "Camera", name: "Camera Shake", code: "wiggle(8, 15)", desc: "Handheld camera shake", prop: "Position" },
    ];

    var propMap = {
        "Position":    function(layer) { return layer.property("Transform").property("Position"); },
        "Rotation":    function(layer) { return layer.property("Transform").property("Rotation"); },
        "Opacity":     function(layer) { return layer.property("Transform").property("Opacity"); },
        "Scale":       function(layer) { return layer.property("Transform").property("Scale"); },
        "Orientation": function(layer) { return layer.property("Transform").property("Orientation"); },
        "Source Text": function(layer) { return layer.property("Source Text"); },
    };

    var propNames = ["Position", "Rotation", "Opacity", "Scale", "Source Text", "Orientation"];
    var cats = ["All", "Motion", "Time", "Text", "Opacity", "Scale", "Control", "Camera", "My Expressions"];

    // Load saved custom expressions
    var savedExprs = [];
    try {
        var settingsKey = "MotionVault_CustomExprs";
        if (app.settings.haveSetting("MotionVault", settingsKey)) {
            var raw = app.settings.getSetting("MotionVault", settingsKey);
            savedExprs = eval("(" + raw + ")");
        }
    } catch(e) { savedExprs = []; }

    function saveCustomExprs() {
        try {
            var arr = [];
            for (var i = 0; i < savedExprs.length; i++) {
                arr.push('{cat:"My Expressions",name:"' + savedExprs[i].name + '",code:"' + savedExprs[i].code.replace(/"/g,'\\"') + '",desc:"' + savedExprs[i].desc + '",prop:"' + savedExprs[i].prop + '"}');
            }
            app.settings.saveSetting("MotionVault", "MotionVault_CustomExprs", "[" + arr.join(",") + "]");
        } catch(e) {}
    }

    function getAllExprs() {
        var all = [];
        for (var i = 0; i < expressions.length; i++) all.push(expressions[i]);
        for (var j = 0; j < savedExprs.length; j++) all.push(savedExprs[j]);
        return all;
    }

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "MotionVault  |  by Ryuvzaki", undefined, { resizeable: true });

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 5;
        win.margins = 8;

        // Header
        var headerGroup = win.add("group");
        headerGroup.orientation = "row";
        headerGroup.alignChildren = ["fill", "center"];
        var titleText = headerGroup.add("statictext", undefined, "MotionVault  |  by Ryuvzaki");
        titleText.alignment = ["fill", "center"];
        var updateBtn = headerGroup.add("button", undefined, "Check Update");
        updateBtn.preferredSize.width = 100;

        // Search
        var searchGroup = win.add("group");
        searchGroup.orientation = "row";
        searchGroup.alignChildren = ["fill", "center"];
        searchGroup.add("statictext", undefined, "Search:").preferredSize.width = 50;
        var searchInput = searchGroup.add("edittext", undefined, "");
        searchInput.preferredSize.width = 200;

        // Category
        var catGroup = win.add("group");
        catGroup.orientation = "row";
        catGroup.alignChildren = ["left", "center"];
        catGroup.add("statictext", undefined, "Category:").preferredSize.width = 60;
        var catDropdown = catGroup.add("dropdownlist", undefined, cats);
        catDropdown.selection = 0;
        catDropdown.preferredSize.width = 150;

        // List
        var listBox = win.add("listbox", undefined, [], {
            numberOfColumns: 3,
            showHeaders: true,
            columnTitles: ["Name", "Property", "Description"],
            columnWidths: [120, 75, 175]
        });
        listBox.preferredSize.height = 180;

        // Preview
        var previewPanel = win.add("panel", undefined, "Expression Code:");
        previewPanel.orientation = "column";
        previewPanel.alignChildren = ["fill", "top"];
        previewPanel.margins = 8;
        var previewText = previewPanel.add("edittext", undefined, "", { multiline: true, readonly: false });
        previewText.preferredSize.height = 50;

        // Property selector
        var propGroup = win.add("group");
        propGroup.orientation = "row";
        propGroup.alignChildren = ["left", "center"];
        propGroup.add("statictext", undefined, "Apply to:").preferredSize.width = 55;
        var propDropdown = propGroup.add("dropdownlist", undefined, propNames);
        propDropdown.selection = 0;
        propDropdown.preferredSize.width = 120;

        // Main buttons
        var btnGroup = win.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignChildren = ["center", "center"];
        btnGroup.spacing = 5;

        var copyBtn = btnGroup.add("button", undefined, "Copy Code");
        copyBtn.preferredSize.width = 90;
        var applyBtn = btnGroup.add("button", undefined, "Apply to Layer");
        applyBtn.preferredSize.width = 110;
        var removeBtn = btnGroup.add("button", undefined, "Remove Expr");
        removeBtn.preferredSize.width = 100;

        // Custom expression buttons
        var customGroup = win.add("group");
        customGroup.orientation = "row";
        customGroup.alignChildren = ["center", "center"];
        customGroup.spacing = 5;
        var saveExprBtn = customGroup.add("button", undefined, "+ Save Custom");
        saveExprBtn.preferredSize.width = 110;
        var deleteExprBtn = customGroup.add("button", undefined, "- Delete Custom");
        deleteExprBtn.preferredSize.width = 120;

        // Footer
        var footer = win.add("statictext", undefined, "v" + CURRENT_VERSION + "  —  MotionVault by Ryuvzaki");
        footer.justify = "center";

        // --- Logic ---
        function getFiltered() {
            var search = searchInput.text.toLowerCase();
            var cat = cats[catDropdown.selection.index];
            var all = getAllExprs();
            var result = [];
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
                var item = listBox.add("item", filtered[i].name);
                item.subItems[0].text = filtered[i].prop;
                item.subItems[1].text = filtered[i].desc;
            }
            previewText.text = "";
        }

        function getSelectedExpr() {
            if (!listBox.selection) return null;
            return getFiltered()[listBox.selection.index];
        }

        function syncPropDropdown(e) {
            if (!e) return;
            for (var i = 0; i < propNames.length; i++) {
                if (propNames[i] === e.prop) {
                    propDropdown.selection = i;
                    break;
                }
            }
        }

        listBox.onChange = function () {
            var e = getSelectedExpr();
            if (e) {
                previewText.text = e.code;
                syncPropDropdown(e);
            }
        };

        searchInput.onChanging = function () { renderList(); };
        catDropdown.onChange = function () { renderList(); };

        copyBtn.onClick = function () {
            var e = getSelectedExpr();
            if (!e) { alert("Please select an expression first!"); return; }
            alert("Copy the code below:\n\n" + e.code);
        };

        applyBtn.onClick = function () {
            var code = previewText.text;
            if (!code || code === "") { alert("Please select an expression first!"); return; }

            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please open a Composition first!"); return;
            }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                alert("Please select a layer first!"); return;
            }

            var propName = propNames[propDropdown.selection.index];
            var getter = propMap[propName];
            if (!getter) { alert("Property not supported!"); return; }

            app.beginUndoGroup("MotionVault: Apply Expression");
            var success = 0;
            var fail = 0;
            for (var i = 0; i < selectedLayers.length; i++) {
                try {
                    var prop = getter(selectedLayers[i]);
                    if (prop) { prop.expression = code; success++; }
                    else { fail++; }
                } catch (err) { fail++; }
            }
            app.endUndoGroup();

            if (success > 0 && fail === 0) {
                alert("Applied to " + success + " layer(s)!\nProperty: " + propName);
            } else if (success > 0) {
                alert("Applied to " + success + " layer(s).\n" + fail + " failed (wrong layer type).");
            } else {
                alert("Failed! Layer type does not have '" + propName + "' property.\nTry changing the 'Apply to' dropdown.");
            }
        };

        removeBtn.onClick = function () {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please open a Composition first!"); return;
            }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                alert("Please select a layer first!"); return;
            }

            var propName = propNames[propDropdown.selection.index];
            var getter = propMap[propName];
            if (!getter) { alert("Property not supported!"); return; }

            app.beginUndoGroup("MotionVault: Remove Expression");
            var success = 0;
            for (var i = 0; i < selectedLayers.length; i++) {
                try {
                    var prop = getter(selectedLayers[i]);
                    if (prop && prop.expression !== "") {
                        prop.expression = "";
                        success++;
                    }
                } catch(err) {}
            }
            app.endUndoGroup();
            alert("Removed expression from " + success + " layer(s).");
        };

        saveExprBtn.onClick = function () {
            var code = previewText.text;
            if (!code || code === "") { alert("Write or select an expression first!"); return; }

            var nameDialog = new Window("dialog", "Save Custom Expression");
            nameDialog.orientation = "column";
            nameDialog.alignChildren = ["fill", "top"];
            nameDialog.margins = 12;
            nameDialog.spacing = 8;

            nameDialog.add("statictext", undefined, "Name:");
            var nameInput = nameDialog.add("edittext", undefined, "My Expression");
            nameInput.preferredSize.width = 250;

            nameDialog.add("statictext", undefined, "Description:");
            var descInput = nameDialog.add("edittext", undefined, "Custom expression");
            descInput.preferredSize.width = 250;

            var dlgBtns = nameDialog.add("group");
            dlgBtns.alignment = ["center", "center"];
            var okBtn = dlgBtns.add("button", undefined, "Save");
            var cancelBtn = dlgBtns.add("button", undefined, "Cancel");

            okBtn.onClick = function () {
                var propName = propNames[propDropdown.selection.index];
                savedExprs.push({
                    cat: "My Expressions",
                    name: nameInput.text,
                    code: code,
                    desc: descInput.text,
                    prop: propName
                });
                saveCustomExprs();
                renderList();
                nameDialog.close();
                alert("Saved: " + nameInput.text);
            };
            cancelBtn.onClick = function () { nameDialog.close(); };
            nameDialog.center();
            nameDialog.show();
        };

        deleteExprBtn.onClick = function () {
            var e = getSelectedExpr();
            if (!e || e.cat !== "My Expressions") {
                alert("Select a custom expression from 'My Expressions' category first!"); return;
            }
            for (var i = 0; i < savedExprs.length; i++) {
                if (savedExprs[i].name === e.name && savedExprs[i].code === e.code) {
                    savedExprs.splice(i, 1);
                    break;
                }
            }
            saveCustomExprs();
            renderList();
            alert("Deleted: " + e.name);
        };

        // Auto-Update check
        updateBtn.onClick = function () {
            try {
                var req = new Socket();
                var host = "raw.githubusercontent.com";
                var path = "/" + GITHUB_USERNAME + "/MotionVault/main/version.json";

                if (req.open(host + ":80")) {
                    req.write("GET " + path + " HTTP/1.0\r\nHost: " + host + "\r\n\r\n");
                    var response = req.read(9999);
                    req.close();

                    var jsonStart = response.indexOf("{");
                    if (jsonStart !== -1) {
                        var jsonStr = response.substring(jsonStart);
                        var data = eval("(" + jsonStr + ")");

                        if (data.version && data.version !== CURRENT_VERSION) {
                            var msg = "New version available!\n\n";
                            msg += "Current: v" + CURRENT_VERSION + "\n";
                            msg += "Latest: v" + data.version + "\n\n";
                            if (data.changelog) msg += "What's new:\n" + data.changelog + "\n\n";
                            msg += "Download the new version from where you purchased it.";
                            alert(msg);
                        } else {
                            alert("You are using the latest version (v" + CURRENT_VERSION + ")!");
                        }
                    } else {
                        alert("Could not check for updates.\nMake sure you are connected to the internet.");
                    }
                } else {
                    alert("Could not connect to update server.\nCheck your internet connection.");
                }
            } catch(err) {
                alert("Update check failed: " + err.toString());
            }
        };

        // First time onboarding
        try {
            var onboardKey = "MotionVault_Onboarded";
            if (!app.settings.haveSetting("MotionVault", onboardKey)) {
                app.settings.saveSetting("MotionVault", onboardKey, "true");
                var welcome = new Window("dialog", "Welcome to MotionVault!");
                welcome.orientation = "column";
                welcome.alignChildren = ["fill", "top"];
                welcome.margins = 16;
                welcome.spacing = 8;
                welcome.add("statictext", undefined, "Welcome to MotionVault by Ryuvzaki!", { name: "title" });
                welcome.add("statictext", undefined, " ");
                welcome.add("statictext", undefined, "How to use:", { name: "sub" });
                var steps = [
                    "1. Browse or search expressions",
                    "2. Select an expression from the list",
                    "3. Select your layer in the timeline",
                    "4. Choose which property to apply to",
                    "5. Click 'Apply to Layer'",
                    " ",
                    "Tip: Save your own expressions with '+ Save Custom'",
                    "Tip: Click 'Check Update' to get latest version"
                ];
                for (var s = 0; s < steps.length; s++) {
                    welcome.add("statictext", undefined, steps[s]);
                }
                welcome.add("statictext", undefined, " ");
                var startBtn = welcome.add("button", undefined, "Let's Go!");
                startBtn.alignment = ["center", "center"];
                startBtn.onClick = function () { welcome.close(); };
                welcome.center();
                welcome.show();
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
