// ============================================
// MotionVault by Kreevo
// After Effects Dockable Panel — v1.0
// ============================================

(function MotionVault(thisObj) {

    var VERSION = "1.0";
    var GITHUB_USER = "Kreevo";
    var VERSION_URL = "https://raw.githubusercontent.com/" + GITHUB_USER + "/MotionVault/main/version.json";

    var expressions = [
        // Motion
        { cat: "Motion",   name: "Wiggle",         code: "wiggle(3, 15)",                                                        prop: "Position", desc: "Shaky random motion"         },
        { cat: "Motion",   name: "Loop",            code: 'loopOut("cycle")',                                                     prop: "Position", desc: "Loop animation infinitely"    },
        { cat: "Motion",   name: "Ping Pong",       code: 'loopOut("pingpong")',                                                  prop: "Position", desc: "Loop back and forth"          },
        { cat: "Motion",   name: "Sine Wave",       code: "[value[0]+Math.sin(time*2)*50, value[1]]",                             prop: "Position", desc: "Smooth wave motion"           },
        { cat: "Motion",   name: "Orbit",           code: "[thisComp.width/2+Math.sin(time)*80, thisComp.height/2+Math.cos(time)*80]", prop: "Position", desc: "Circular orbit"         },
        { cat: "Motion",   name: "Spin",            code: "time * 90",                                                           prop: "Rotation", desc: "Continuous rotation 90deg/s"  },
        { cat: "Motion",   name: "Bounce",          code: "amp=0.1;freq=2;decay=4;n=0;if(numKeys>0){n=nearestKey(time).index;if(key(n).time>time)n--;}if(n>0){t=time-key(n).time;v=velocityAtTime(key(n).time-0.001)*amp;value+v*Math.sin(freq*2*Math.PI*t)/Math.exp(decay*t);}else value", prop: "Position", desc: "Elastic bounce" },

        // Opacity
        { cat: "Opacity",  name: "Fade In",         code: "linear(time, inPoint, inPoint+0.5, 0, 100)",                          prop: "Opacity",  desc: "Fade in on layer start"      },
        { cat: "Opacity",  name: "Fade Out",        code: "linear(time, outPoint-0.5, outPoint, 100, 0)",                        prop: "Opacity",  desc: "Fade out on layer end"        },
        { cat: "Opacity",  name: "Fade In+Out",     code: "t1=inPoint+0.3;t2=outPoint-0.3;if(time<t1)linear(time,inPoint,t1,0,100)else if(time>t2)linear(time,t2,outPoint,100,0)else 100", prop: "Opacity", desc: "Auto fade in and out" },
        { cat: "Opacity",  name: "Pulse",           code: "(Math.sin(time*4)+1)/2*100",                                          prop: "Opacity",  desc: "Pulsing opacity"             },
        { cat: "Opacity",  name: "Blink",           code: "(time%1<0.5)?100:0",                                                  prop: "Opacity",  desc: "Blinking every 1s"           },

        // Scale
        { cat: "Scale",    name: "Breathe",         code: "s=Math.sin(time*2)*5+100;[s,s]",                                      prop: "Scale",    desc: "Gentle breathing"            },
        { cat: "Scale",    name: "Pop In",          code: "linear(time, inPoint, inPoint+0.2, 0, 100)",                          prop: "Scale",    desc: "Quick pop in"                },
        { cat: "Scale",    name: "Wiggle Scale",    code: "wiggle(2, 10)",                                                       prop: "Scale",    desc: "Random scale shake"          },

        // Text
        { cat: "Text",     name: "Count Up",        code: "linear(time, 0, 3, 0, 100).toFixed(0)",                               prop: "Source Text", desc: "Count 0 to 100 in 3s"    },
        { cat: "Text",     name: "Stopwatch",       code: "timeToCurrentFormat()",                                               prop: "Source Text", desc: "Show current time"         },

        // Control
        { cat: "Control",  name: "Slider Link",     code: 'thisComp.layer("Control").effect("Slider")("Slider")',                prop: "Opacity",  desc: "Link to slider control"     },
        { cat: "Control",  name: "Checkbox Toggle", code: 'thisComp.layer("Control").effect("Checkbox Control")("Checkbox")?100:0', prop: "Opacity", desc: "Toggle with checkbox"    },

        // Camera
        { cat: "Camera",   name: "Shake",           code: "wiggle(8, 15)",                                                       prop: "Position", desc: "Handheld camera shake"       },
        { cat: "Camera",   name: "Depth Scale",     code: "s=1000/(1000-position[2]);[s,s]",                                     prop: "Scale",    desc: "Scale by Z depth"            },
    ];

    var propNames = ["Position", "Rotation", "Opacity", "Scale", "Source Text", "Orientation"];
    var cats      = ["All", "Motion", "Opacity", "Scale", "Text", "Control", "Camera", "⭐ Favorites", "🕐 Recent", "📁 Mine"];

    var propMap = {
        "Position":    function(l){ return l.property("Transform").property("Position"); },
        "Rotation":    function(l){ return l.property("Transform").property("Rotation"); },
        "Opacity":     function(l){ return l.property("Transform").property("Opacity"); },
        "Scale":       function(l){ return l.property("Transform").property("Scale"); },
        "Orientation": function(l){ return l.property("Transform").property("Orientation"); },
        "Source Text": function(l){ return l.property("Source Text"); },
    };

    // Storage
    var favs = {}, recent = [], custom = [], history = [];

    function load() {
        try { if(app.settings.haveSetting("MV","favs"))     favs   = eval("("+app.settings.getSetting("MV","favs")+")"); }   catch(e){}
        try { if(app.settings.haveSetting("MV","recent"))   recent = eval("("+app.settings.getSetting("MV","recent")+")"); } catch(e){}
        try { if(app.settings.haveSetting("MV","custom"))   custom = eval("("+app.settings.getSetting("MV","custom")+")"); } catch(e){}
        try { if(app.settings.haveSetting("MV","history"))  history= eval("("+app.settings.getSetting("MV","history")+")"); }catch(e){}
    }

    function saveFavs()   { try{ var a=[];for(var k in favs)a.push('"'+k+'":true'); app.settings.saveSetting("MV","favs","{"+a.join(",")+"}"); }catch(e){} }
    function saveRecent() { try{ var a=[];for(var i=0;i<recent.length;i++)a.push('"'+recent[i].replace(/"/g,'\\"')+'"'); app.settings.saveSetting("MV","recent","["+a.join(",")+"]"); }catch(e){} }
    function saveCustom() {
        try {
            var a=[];
            for(var i=0;i<custom.length;i++){
                var e=custom[i];
                a.push('{cat:"Mine",name:"'+e.name.replace(/"/g,'\\"')+'",code:"'+e.code.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'",prop:"'+e.prop+'",desc:"'+e.desc.replace(/"/g,'\\"')+'"}');
            }
            app.settings.saveSetting("MV","custom","["+a.join(",")+"]");
        }catch(e){}
    }

    function addRecent(name) {
        for(var i=recent.length-1;i>=0;i--) if(recent[i]===name) recent.splice(i,1);
        recent.unshift(name);
        if(recent.length>8) recent.pop();
        saveRecent();
    }

    function allExprs() {
        var a=[];
        for(var i=0;i<expressions.length;i++) a.push(expressions[i]);
        for(var j=0;j<custom.length;j++) a.push(custom[j]);
        return a;
    }

    load();

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj
            : new Window("palette", "MotionVault  —  by Kreevo", undefined, {resizeable:true});

        win.orientation = "column";
        win.alignChildren = ["fill","top"];
        win.spacing = 6;
        win.margins = [10,10,10,10];

        // ── HEADER ──
        var hdr = win.add("group");
        hdr.orientation = "row";
        hdr.alignChildren = ["fill","center"];
        hdr.spacing = 6;

        var hdrLeft = hdr.add("group");
        hdrLeft.orientation = "column";
        hdrLeft.alignChildren = ["left","center"];
        hdrLeft.spacing = 0;
        var hdrTitle = hdrLeft.add("statictext", undefined, "MotionVault");
        var hdrSub   = hdrLeft.add("statictext", undefined, "by Kreevo  ·  v"+VERSION);

        var updBtn = hdr.add("button", undefined, "↑ Update");
        updBtn.preferredSize = [80, 24];

        // ── SEARCH ──
        var searchGrp = win.add("group");
        searchGrp.orientation = "row";
        searchGrp.alignChildren = ["fill","center"];
        searchGrp.spacing = 4;
        var searchIn = searchGrp.add("edittext", undefined, "");
        searchIn.preferredSize.height = 24;
        var clearBtn = searchGrp.add("button", undefined, "✕");
        clearBtn.preferredSize = [24,24];

        // ── CATEGORY ──
        var catGrp = win.add("group");
        catGrp.orientation = "row";
        catGrp.alignChildren = ["left","center"];
        catGrp.spacing = 4;
        var catDrop = catGrp.add("dropdownlist", undefined, cats);
        catDrop.selection = 0;
        catDrop.preferredSize.width = 160;
        var surpriseBtn = catGrp.add("button", undefined, "✦");
        surpriseBtn.preferredSize = [24,24];
        surpriseBtn.helpTip = "Surprise me!";

        // ── LIST ──
        var listBox = win.add("listbox", undefined, [], {
            numberOfColumns: 3,
            showHeaders: true,
            columnTitles: ["Name", "Property", "Description"],
            columnWidths: [110, 75, 175]
        });
        listBox.preferredSize.height = 190;

        // ── CODE PREVIEW ──
        var prevPanel = win.add("panel", undefined, "Code:");
        prevPanel.orientation = "column";
        prevPanel.alignChildren = ["fill","top"];
        prevPanel.margins = [6,14,6,6];
        var prevText = prevPanel.add("edittext", undefined, "", {multiline:true, readonly:false});
        prevText.preferredSize.height = 50;

        // ── APPLY TO ──
        var applyGrp = win.add("group");
        applyGrp.orientation = "row";
        applyGrp.alignChildren = ["left","center"];
        applyGrp.spacing = 6;
        applyGrp.add("statictext", undefined, "Apply to:");
        var propDrop = applyGrp.add("dropdownlist", undefined, propNames);
        propDrop.selection = 0;
        propDrop.preferredSize.width = 110;

        // ── MAIN BUTTONS ──
        var btnGrp = win.add("group");
        btnGrp.orientation = "row";
        btnGrp.alignChildren = ["center","center"];
        btnGrp.spacing = 5;
        var copyBtn   = btnGrp.add("button", undefined, "Copy");
        copyBtn.preferredSize.width = 70;
        var applyBtn  = btnGrp.add("button", undefined, "Apply to Layer");
        applyBtn.preferredSize.width = 120;
        var removeBtn = btnGrp.add("button", undefined, "Remove");
        removeBtn.preferredSize.width = 70;

        // ── SECONDARY BUTTONS ──
        var secGrp = win.add("group");
        secGrp.orientation = "row";
        secGrp.alignChildren = ["center","center"];
        secGrp.spacing = 5;
        var favBtn    = secGrp.add("button", undefined, "☆ Fav");
        favBtn.preferredSize.width = 70;
        var saveBtn   = secGrp.add("button", undefined, "+ Save");
        saveBtn.preferredSize.width = 70;
        var deleteBtn = secGrp.add("button", undefined, "− Delete");
        deleteBtn.preferredSize.width = 70;
        var exportBtn = secGrp.add("button", undefined, "Export");
        exportBtn.preferredSize.width = 60;
        var importBtn = secGrp.add("button", undefined, "Import");
        importBtn.preferredSize.width = 60;

        // ── STATS ──
        var statsGrp = win.add("group");
        statsGrp.orientation = "row";
        statsGrp.alignChildren = ["center","center"];
        var statsText = statsGrp.add("statictext", undefined, "");
        statsText.alignment = ["center","center"];

        function refreshStats() {
            var total = expressions.length + custom.length;
            var fc = 0; for(var k in favs) if(favs[k]) fc++;
            statsText.text = total+" expressions  ·  "+fc+" favorites  ·  "+custom.length+" custom";
        }

        // ── LOGIC ──
        function getFiltered() {
            var s = searchIn.text.toLowerCase();
            var cat = cats[catDrop.selection.index];
            var all = allExprs();
            var out = [];

            if(cat === "⭐ Favorites") {
                for(var i=0;i<all.length;i++) if(favs[all[i].name]) out.push(all[i]);
                return out;
            }
            if(cat === "🕐 Recent") {
                for(var r=0;r<recent.length;r++)
                    for(var a=0;a<all.length;a++)
                        if(all[a].name===recent[r]){ out.push(all[a]); break; }
                return out;
            }
            if(cat === "📁 Mine") {
                return custom;
            }

            for(var i=0;i<all.length;i++){
                var e=all[i];
                var mc=(cat==="All")||(e.cat===cat);
                var ms=(s==="")||(e.name.toLowerCase().indexOf(s)!==-1)||(e.code.toLowerCase().indexOf(s)!==-1)||(e.desc.toLowerCase().indexOf(s)!==-1);
                if(mc&&ms) out.push(e);
            }
            return out;
        }

        function renderList() {
            listBox.removeAll();
            var f=getFiltered();
            for(var i=0;i<f.length;i++){
                var star = favs[f[i].name]?"★ ":"";
                var item = listBox.add("item", star+f[i].name);
                item.subItems[0].text = f[i].prop;
                item.subItems[1].text = f[i].desc;
            }
            refreshStats();
        }

        function getSelected() {
            if(!listBox.selection) return null;
            return getFiltered()[listBox.selection.index];
        }

        function syncProp(e) {
            if(!e) return;
            for(var i=0;i<propNames.length;i++)
                if(propNames[i]===e.prop){ propDrop.selection=i; break; }
        }

        listBox.onChange = function() {
            var e=getSelected();
            if(!e) return;
            prevText.text = e.code;
            syncProp(e);
            favBtn.text = favs[e.name]?"★ Unfav":"☆ Fav";
        };

        searchIn.onChanging = function(){ catDrop.selection=0; renderList(); };
        clearBtn.onClick    = function(){ searchIn.text=""; renderList(); };
        catDrop.onChange    = function(){ renderList(); };

        surpriseBtn.onClick = function() {
            var all=allExprs();
            if(!all.length) return;
            var e=all[Math.floor(Math.random()*all.length)];
            prevText.text=e.code; syncProp(e);
            alert("✦ Surprise!\n\n"+e.name+"\n"+e.desc);
        };

        copyBtn.onClick = function() {
            var e=getSelected();
            if(!e){ alert("Select an expression first."); return; }
            alert("Copy:\n\n"+e.code);
        };

        applyBtn.onClick = function() {
            var code=prevText.text;
            if(!code){ alert("Select or write an expression first."); return; }
            var comp=app.project.activeItem;
            if(!comp||!(comp instanceof CompItem)){ alert("Open a Composition first."); return; }
            var layers=comp.selectedLayers;
            if(!layers.length){ alert("Select a layer first."); return; }
            var pName=propNames[propDrop.selection.index];
            var getter=propMap[pName];
            if(!getter){ alert("Property not supported."); return; }
            app.beginUndoGroup("MotionVault: Apply");
            var ok=0, fail=0;
            for(var i=0;i<layers.length;i++){
                try{ var p=getter(layers[i]); if(p){p.expression=code;ok++;}else fail++; }
                catch(err){ fail++; }
            }
            app.endUndoGroup();
            var e=getSelected();
            if(e){ addRecent(e.name); }
            if(ok>0){
                applyBtn.text="✓ Applied!";
                var t=new Date().getTime(); while(new Date().getTime()-t<700){}
                applyBtn.text="Apply to Layer";
            }
            if(fail>0) alert("Applied: "+ok+"  Failed: "+fail+"\n(Wrong layer type for '"+pName+"')");
            renderList();
        };

        removeBtn.onClick = function() {
            var comp=app.project.activeItem;
            if(!comp||!(comp instanceof CompItem)){ alert("Open a Composition first."); return; }
            var layers=comp.selectedLayers;
            if(!layers.length){ alert("Select a layer first."); return; }
            var getter=propMap[propNames[propDrop.selection.index]];
            if(!getter) return;
            app.beginUndoGroup("MotionVault: Remove");
            var ok=0;
            for(var i=0;i<layers.length;i++){
                try{ var p=getter(layers[i]); if(p&&p.expression!==""){p.expression="";ok++;} }catch(er){}
            }
            app.endUndoGroup();
            alert("Removed from "+ok+" layer(s).");
        };

        favBtn.onClick = function() {
            var e=getSelected();
            if(!e){ alert("Select an expression first."); return; }
            if(favs[e.name]) delete favs[e.name]; else favs[e.name]=true;
            saveFavs();
            favBtn.text = favs[e.name]?"★ Unfav":"☆ Fav";
            renderList();
        };

        saveBtn.onClick = function() {
            var code=prevText.text;
            if(!code){ alert("Write or select an expression first."); return; }
            var dlg=new Window("dialog","Save Expression");
            dlg.orientation="column"; dlg.alignChildren=["fill","top"]; dlg.margins=14; dlg.spacing=8;
            dlg.add("statictext",undefined,"Name:");
            var nameIn=dlg.add("edittext",undefined,"My Expression"); nameIn.preferredSize.width=240;
            dlg.add("statictext",undefined,"Description:");
            var descIn=dlg.add("edittext",undefined,""); descIn.preferredSize.width=240;
            var btns=dlg.add("group"); btns.alignment=["center","center"];
            var ok=btns.add("button",undefined,"Save");
            var cancel=btns.add("button",undefined,"Cancel");
            ok.onClick=function(){
                custom.push({cat:"Mine",name:nameIn.text,code:code,desc:descIn.text,prop:propNames[propDrop.selection.index]});
                saveCustom(); renderList(); dlg.close();
                alert("Saved: "+nameIn.text);
            };
            cancel.onClick=function(){ dlg.close(); };
            dlg.center(); dlg.show();
        };

        deleteBtn.onClick = function() {
            var e=getSelected();
            if(!e||e.cat!=="Mine"){ alert("Select a custom expression from '📁 Mine' first."); return; }
            for(var i=0;i<custom.length;i++) if(custom[i].name===e.name){ custom.splice(i,1); break; }
            saveCustom(); renderList();
        };

        exportBtn.onClick = function() {
            try{
                var f=File.saveDialog("Export expressions","JSON:*.json");
                if(!f) return;
                f.open("w");
                var a=[];
                for(var i=0;i<custom.length;i++){
                    var e=custom[i];
                    a.push('{"name":"'+e.name.replace(/"/g,'\\"')+'","code":"'+e.code.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'","desc":"'+e.desc.replace(/"/g,'\\"')+'","prop":"'+e.prop+'"}');
                }
                f.write("["+a.join(",")+"]"); f.close();
                alert("Exported "+custom.length+" expressions.");
            }catch(err){ alert("Export failed: "+err); }
        };

        importBtn.onClick = function() {
            try{
                var f=File.openDialog("Import expressions","JSON:*.json");
                if(!f) return;
                f.open("r"); var content=f.read(); f.close();
                var data=eval("("+content.substring(content.indexOf("["))+")");
                var added=0;
                for(var i=0;i<data.length;i++){
                    if(data[i].name&&data[i].code){
                        custom.push({cat:"Mine",name:data[i].name,code:data[i].code,desc:data[i].desc||"",prop:data[i].prop||"Position"});
                        added++;
                    }
                }
                saveCustom(); renderList();
                alert("Imported "+added+" expressions.");
            }catch(err){ alert("Import failed: "+err); }
        };

        // Auto-Update
        updBtn.onClick = function() {
            try{
                var tmp=new File(Folder.temp.absoluteURI+"/mv_ver.json");
                var isWin=$.os.indexOf("Windows")!==-1;
                system.callSystem((isWin?'curl -s -o "'+tmp.fsName+'"':'curl -s -o "'+tmp.absoluteURI+'"')+' "'+VERSION_URL+'"');
                var t=new Date().getTime(); while(new Date().getTime()-t<2500){}
                if(!tmp.exists){ alert("Could not reach update server."); return; }
                tmp.open("r"); var raw=tmp.read(); tmp.close(); tmp.remove();
                var j=raw.indexOf("{"); if(j===-1){ alert("Invalid response."); return; }
                var d=eval("("+raw.substring(j)+")");
                if(!d.version||d.version===VERSION){ alert("You're on the latest version (v"+VERSION+")."); return; }
                var msg="New version available!\n\nCurrent: v"+VERSION+"\nLatest: v"+d.version;
                if(d.changelog) msg+="\n\nWhat's new:\n"+d.changelog;
                msg+="\n\nInstall now?";
                if(!confirm(msg)) return;
                updBtn.text="Updating...";
                var dlUrl=d.download||("https://raw.githubusercontent.com/"+GITHUB_USER+"/MotionVault/main/MotionVault_Kreevo.jsx");
                var tmpJsx=new File(Folder.temp.absoluteURI+"/MV_update.jsx");
                system.callSystem((isWin?'curl -s -o "'+tmpJsx.fsName+'"':'curl -s -o "'+tmpJsx.absoluteURI+'"')+' "'+dlUrl+'"');
                var t2=new Date().getTime(); while(new Date().getTime()-t2<4000){}
                if(!tmpJsx.exists){ updBtn.text="↑ Update"; alert("Download failed. Try again."); return; }
                tmpJsx.open("r"); var code=tmpJsx.read(); tmpJsx.close(); tmpJsx.remove();
                var dest=new File(new File($.fileName).fsName);
                dest.open("w"); dest.write(code); dest.close();
                updBtn.text="↑ Update";
                alert("Updated to v"+d.version+"!\nPlease restart After Effects.");
            }catch(err){ updBtn.text="↑ Update"; alert("Update failed: "+err); }
        };

        // Onboarding
        try{
            if(!app.settings.haveSetting("MV","ob1")){
                app.settings.saveSetting("MV","ob1","1");
                var w=new Window("dialog","Welcome to MotionVault");
                w.orientation="column"; w.alignChildren=["fill","top"]; w.margins=20; w.spacing=10;
                w.add("statictext",undefined,"MotionVault  by Kreevo  —  v"+VERSION);
                w.add("statictext",undefined," ");
                var lines=["Select expression → select layer → Apply to Layer","Change 'Apply to' dropdown to target any property","☆ Fav to save favorites  ·  + Save for custom expressions","✦ for a random surprise"];
                for(var i=0;i<lines.length;i++) w.add("statictext",undefined,lines[i]);
                w.add("statictext",undefined," ");
                var gb=w.add("button",undefined,"Let's go →");
                gb.alignment=["center","center"];
                gb.onClick=function(){ w.close(); };
                w.center(); w.show();
            }
        }catch(e){}

        renderList();
        if(win instanceof Window){ win.center(); win.show(); }
        else { win.layout.layout(true); }
        return win;
    }

    buildUI(thisObj);

}(this));
