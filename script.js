var interactablesFunctions = {
	showMessage: (text, then, once=false) => {
		return (interactableElement, interactable) => {
			var messageElement = new TemplatedHtml(
				"post",
				document.getElementById("root")
			);
			messageElement.element.textContent = text;
			document.body.addEventListener(
				"keydown",
				() => {
					messageElement.element.remove();
					if (then) {
						then(interactableElement, interactable);
					}
				},
				{
					once: true
				}
			);
			if(once){
				interactable.deactivate();
			}
		};
	},
	showElement: (element, then) => {
		return (interactableElement, interactable) => {
			var messageElement = new TemplatedHtml(
				element,
				document.getElementById("root")
			);
			document.body.addEventListener(
				"keydown",
				() => {
					messageElement.element.remove();
					if (then) {
						then(interactableElement, interactable);
					}
				},
				{
					once: true
				}
			);
		};
	}
};
var newId=Math.random;
var tstreetData = {
	street1: {
		interactablesList: [
			{
				element: "interactableTest",
				instructionsElement: "Open",
				pos: new Vec2(50, -20),
				onInteract: interactablesFunctions.showElement("post", (elem) => {
					elem.updateText("📪", "icon");
				})
			},
			{
				icon: "🌿",
				element: "someGrass",
				pos: new Vec2(150, -60),
				onInteract: interactablesFunctions.showMessage(
					"wow some Poa annua along with other species of grass!"
				)
			},
			{
				icon: "🎃",
				element: "someGrass",
				pos: new Vec2(200, -30),
				onInteract: interactablesFunctions.showMessage(
					"It's not even Halloween...",
					(elem, interactable) => {
						elem.updateText("🥣", "icon");
						interactable.onInteract = interactablesFunctions.showMessage(
							"That's better"
						);
					}
				)
			}
		],
		junctions: [
			{
				street: "street2",
				pos: { x: 150, y: -10 },
				backwards:true,
			}
		]
	},
	street2: {
		interactablesList: [
			{
				icon: "🥗",
				element: "someGrass",
				pos: new Vec2(50, -20),
				onInteract: interactablesFunctions.showMessage("Wow some more grass")
			},
			{
				icon: "🐒",
				element: "someGrass",
				pos: new Vec2(120, -20),
				onInteract: interactablesFunctions.showMessage(
					"It stole my phone",
					(elem, interactable) => {
						elem.element.classList.add("runOff");
					},
					true
				)
			},
			{
				icon: "👨‍🦳",
				element: "someGrass",
				pos: new Vec2(150, -30),
				onInteract:                 interactablesFunctions.showMessage("My body disapeared 2 years ago. I've been stuck here ever since.",(l, interactable) => {
				interactable.setInteraction(interactablesFunctions.showMessage("Luckily I dont need to eat any more",(l, interactable) => {
				interactable.setInteraction(interactablesFunctions.showMessage("The kids play football with me",(l, interactable) => {
				interactable.setInteraction(interactablesFunctions.showMessage("I dont have any achey joints though",(l, interactable) => {
			 	interactable.setInteraction(interactablesFunctions.showMessage("other than my jaw.",(l,i)=>{i.deactivate()}));
				})); })); })); })
			}
			
		],
		junctions: [
			{
				street: "street1",
				pos: { x: 10, y: -50 },
				backwards:false,
			},
			{
				street: "street3",
				pos: { x: 200, y: -70 },
				backwards:false,
			}
		]
	},
	street3: {
		interactablesList: [
			{
				icon: "🥗",
				element: "someGrass",
				pos: new Vec2(50, -20),
				onInteract: interactablesFunctions.showMessage("Wow some more grass")
			},
			{
				icon: "🐒",
				element: "someGrass",
				pos: new Vec2(120, -20),
				onInteract: interactablesFunctions.showMessage(
					"It stole my hat!",
					(elem, interactable) => {
						elem.element.classList.add("runOff");
					},
					true
				)
			}],
		junctions:[
			
			{
				street: "street2",
				pos: { x: 150, y: -70 },
				backwards:true,
			}
		]
	}
};


class PersistentInteractables{
	constructor(){
		this.persist = {};
	}
	setIdsOnStreetData(streetData){
		for(var key in tstreetData){
			var street = tstreetData[key];
			var interactables = street.interactablesList;
			interactables.forEach(i=>{
				i.id = newId();
			});
		}
	}
	save(id,data){
		this.persist[id] = data;
	}
	get(id){
		if(!this.persist.hasOwnProperty(id)){
			return false;
		}
		return this.persist[id];
		
	}
}


var persistanceManager = new PersistentInteractables();
persistanceManager.setIdsOnStreetData();

class Interactable {
	constructor(dat, parentElement) {
		this.id = dat.id;
		this.text = dat.text;
		this.pos = dat.pos;
		
		this.range = 20;
		this.isInRange = false;
		this.setInteraction(dat.onInteract);
		this.element = new TemplatedHtml(dat.element, parentElement);
		this.instructionsElement = new TemplatedHtml(
			"instructions",
			this.element.element
		);
		if (dat.icon) {
			this.element.getPart("icon").textContent = dat.icon;
		}
		if (dat.interactText) {
			this.instructionsElement.updateText(dat.interactText + " - E");
		}
		this.eventToRemove = (e)=>{this.onEDown(e)};
		document.addEventListener("keydown",this.eventToRemove );
	}
	onEDown(e){
		
		if (e.key != "e") {
			return;
		}
		if (!this.isInRange) {
			return;
		}
		this.onInteract(this.element);
		//persistanceManager.save(this.id, this);
	}
	updateText(text) {
		this.text = text;
	}
	update() {}
	draw() {
		this.element.element.style.top = -this.pos.y + "px";
		this.element.element.style.left = this.pos.x + "px";
		if (this.isInRange) {
			this.instructionsElement.element.classList.add("show");
		} else {
			this.instructionsElement.element.classList.remove("show");
		}
	}
	destroy(){
		document.removeEventListener("keydown",this.eventToRemove);
		this.range = 0;
		this.element.element.remove();
	}
	deactivate(){
		this.range = 0;
	}
	setInteraction(func){
		this.onInteract = (elem) => {
			func(elem,this);
		};
	}
}
class InteractableHelper {
	constructor(player, interactable) {
		this.player = player;
		this.interactable = interactable;
	}
	update() {
		if (
			this.player.pos.distance(this.interactable.pos) < this.interactable.range
		) {
			this.interactable.isInRange = true;
		} else {
			this.interactable.isInRange = false;
		}
	}
	draw() {}
}
class DirectionalInputManager {
	constructor() {
		this.currentDirection = new Vec2(0, 0);
		this.keyMaps = {
			ArrowLeft: new Vec2(-1, 0),
			ArrowRight: new Vec2(1, 0),
			ArrowUp: new Vec2(0, 1),
			ArrowDown: new Vec2(0, -1),
			a: new Vec2(-1, 0),
			d: new Vec2(1, 0),
			w: new Vec2(0, 1),
			s: new Vec2(0, -1)
		};
		this.keysDown = [];
		document.addEventListener("keydown", (e) => {
			this.onKeyDown(e.key);
		});
		document.addEventListener("keyup", (e) => {
			this.onKeyUp(e.key);
		});
	}
	onKeyDown(key) {
		if (!this.keysDown.includes(key)) {
			this.keysDown.push(key);
		}
	}
	onKeyUp(key) {
		this.keysDown = this.keysDown.filter((i) => i != key);
	}
	getDirection() {
		var vecTotal = new Vec2(0, 0);
		for (var i = 0; i < this.keysDown.length; i++) {
			var key = this.keysDown[i];
			if (!this.keyMaps.hasOwnProperty(key)) {
				continue;
			}
			var keyvec = this.keyMaps[key];
			vecTotal = vecTotal.add(keyvec);
		}
		return vecTotal.normalised();
	}
}
class Player {
	constructor(parentElement) {
		this.pos = new Vec2(20, -20);
		this.speed = 80;
		this.element = new TemplatedHtml("person", parentElement);
		this.movementInput = new DirectionalInputManager();
		this.flip = false;
		this.isMoving = false;
	}
	perspective(y) {
		return 1;
		return 1 - y / 100;
	}
	update() {
		var dir = this.movementInput.getDirection();
		if (isNaN(dir.x)) {
			dir = new Vec2(0, 0);
		}
		this.isMoving = dir.magnitude() > 0.01;

		if (this.isMoving) {
			dir = dir.times(this.perspective(this.pos.y));

			var delta = dir.times(this.speed * timeSpeedMod);

			this.pos = this.pos.add(delta);

			if (dir.x > 0) {
				this.flip = true;
			} else if (dir.x < 0) {
				this.flip = false;
			}
		}
	}

	draw() {
		this.element.element.style.top = -this.pos.y + "px";
		this.element.element.style.left = this.pos.x + "px";

		var scale = new Vec2(1, 1);
		//var scale = new Vec2(this.perspective(this.pos.y),this.perspective(this.pos.y));

		if (this.flip) {
			scale.x = -Math.abs(scale.x);
		} else {
			scale.x = Math.abs(scale.x);
		}

		this.element.element.style.transform =
			"scalex(" + scale.x + ") scaley(" + scale.y + ")";

		if (this.isMoving) {
			this.element.updateText("🏃‍♂️");
		} else {
			this.element.updateText("🧍‍♀️");
		}
	}
	setParent(element) {
		this.element.appendInto(element);
	}
}

class Street {
	constructor(streetData,changeStreetFunc) {
		this.element = new TemplatedHtml("path", document.getElementById("root"));
		this.changeStreet = changeStreetFunc;
		this.setupBackground();
		this.setupForeground();
		this.setupMidground(streetData);
	}
	setupBackground() {
		this.backgroundElements = [];
		var buildingCount = 14;
		for (var i = 0; i < buildingCount; i++) {
			this.backgroundElements.push(
				new TemplatedHtml("building", this.element.getPart("background"))
			);
		}
	}
	setupForeground() {
		this.backgroundElements = [];
		var buildingCount = 24;
		for (var i = 0; i < buildingCount; i++) {
			this.backgroundElements.push(
				new TemplatedHtml("plant", this.element.getPart("foreground"))
			);
		}
	}
	setupMidground(streetData) {
		this.interactables = [];
		for (var i = 0; i < streetData.interactablesList.length; i++) {
			var dat = streetData.interactablesList[i];
			
			var persisted = false;//persistanceManager.get(dat.id);
			let intr;
			if(persisted){
				intr = persisted;
				return;
			}else{
				intr = new Interactable(dat, this.element.getPart("middleground"));
			}
			
			this.interactables.push(intr);
			this.interactables.push(new InteractableHelper(this.player, intr));
		}
		for (var i = 0; i < streetData.junctions.length; i++) {
			let junctionDat = streetData.junctions[i];
			let interactableData = {
				element:"someGrass",
				icon:"↕",
				interactText:"Go to "+junctionDat.street, 
				pos:new Vec2(junctionDat.pos),
				onInteract:()=>{
					this.changeStreet(junctionDat.street);
				}
			}
			var intr = new Interactable(interactableData, this.element.getPart("middleground"));
			this.interactables.push(intr);
			this.interactables.push(new InteractableHelper(this.player, intr));
		}
	}
	setPlayer(player,pos) {
		player.setParent(this.element.getPart("middleground"));
		player.pos = pos;
		this.interactables.forEach((e, i) => {
			if (e instanceof InteractableHelper) {
				e.player = player;
			}
		});
	}
	update() {
		this.interactables.forEach((i) => i.update());
	}
	draw() {
		this.interactables.forEach((i) => i.draw());
	}
	destroy(){
		this.interactables.forEach((e, i) => {
			if(e.destroy){
				e.destroy();
			}
			
		});
		this.element.element.remove();
	}
}
class StreetTransition{
	constructor(prevStreet,newStreet,junctionFrom,junctionTo,onTransitionEndCallback){
		this.transitionElement = new TemplatedHtml("streetTransition",document.getElementById("root"))
		this.junctionFrom = junctionFrom;
		this.junctionTo = junctionTo;
		this.newStreet = newStreet;
		this.prevStreet = prevStreet;
		
		var angle = 80;
		
		this.onTransitionEndCallback = onTransitionEndCallback;
		this.prevStreet.element.appendInto(this.transitionElement.getPart("streetFrom"));
		this.newStreet.element.appendInto(this.transitionElement.getPart("streetTo"));
		
		var rotDir = !junctionFrom.backwards?-1:1;
		//a = from, b=to
		
		var width = this.prevStreet.element.element.offsetWidth;
		//Set initial state
		this.transitionElement.getPart("streetFrom").style.transform = "rotateY(0) translatex(0) translatez(0)";
		//this.transitionElement.getPart("streetB").style.transform = "translatex("+junctionTo.pos.x+"px) translatez("+junctionFrom.pos.x+"px) rotateY("+((rotDir*90))+"deg)";
		var otherTranslate = new Vec2(-(junctionTo.pos.x-(width/2)),rotDir*(junctionFrom.pos.x-(width/2)))
		this.transitionElement.getPart("streetTo").style.transform = "rotateY("+((rotDir*angle))+"deg) translatex("+otherTranslate.x+"px) translatez("+otherTranslate.y+"px)";
		this.transitionElement.getPart("streetTo").style.opacity = 0;
		
		setTimeout(()=>{
			//animate to
			this.transitionElement.getPart("streetTo").style.opacity=1;
			this.transitionElement.getPart("streetFrom").style.opacity=0;
			//this.transitionElement.getPart("streetTo").style.opacity=0;
			this.transitionElement.getPart("streetAssembly").style.transform = "translatez("+-otherTranslate.y+"px) translatex("+-otherTranslate.x+"px) rotateY("+((-rotDir*angle))+"deg)";
		},5)
		setTimeout(()=>{
			this.onTransisionEnd();
		},500);
	}
	onTransisionEnd(){
		document.getElementById("root").prepend(this.newStreet.element.element);
		this.transitionElement.element.remove();
		this.onTransitionEndCallback();
	}
}

class World {
	constructor(levelData) {
		this.stuffThatNeedsUpdating = [];
		this.player = new Player(document.body);
		this.changeStreet("street1",false);
		this.inStreetTransition = false;
	}
	changeStreet(streetId) {
		if(this.inStreetTransition){
			return;
		}
		this.inStreetTransition=true;
		var prevStreetId = this.streetId;
		var newStreetData = tstreetData[streetId];
		var playerPos;
		
		if(!prevStreetId){
			//initial player pos
			playerPos = new Vec2(0,0);
		}else{
			playerPos = new Vec2(newStreetData.junctions.find(i=>i.street == prevStreetId).pos);
		}
		this.streetId = streetId;
		
		if(prevStreetId){
			
	
			var newStreet =  new Street(tstreetData[streetId],(s)=>{this.changeStreet(s)});
			var prevStreet = this.currentStreet;
			
			var junctionFrom = tstreetData[prevStreetId].junctions.find(i=>i.street==streetId);
			var junctionTo = tstreetData[streetId].junctions.find(i=>i.street==prevStreetId);
			
			this.stuffThatNeedsUpdating = [];
			new StreetTransition(
				prevStreet,
				newStreet,
				junctionFrom,
				junctionTo,
			()=>{
				this.inStreetTransition=false;
				prevStreet.destroy();
			});
			
			this.currentStreet = newStreet;
			this.currentStreet.setPlayer(this.player, playerPos);
			this.stuffThatNeedsUpdating.push(this.currentStreet);
		}else{
			this.currentStreet = new Street(tstreetData[streetId],(s)=>{this.changeStreet(s)});
			
			this.currentStreet.setPlayer(this.player, playerPos);
			this.stuffThatNeedsUpdating.push(this.currentStreet);
		}
	}
	update() {
		this.player.update();
		this.stuffThatNeedsUpdating.forEach((i) => i.update());
	}

	draw() {
		this.player.draw();
		this.stuffThatNeedsUpdating.forEach((i) => i.draw());
	}
}

document.body.addEventListener("click", () => {
	document.getElementById("startButton")?.remove();
});

window.world = new World();

var TickTime = 10;
var timeSpeedMod = TickTime / 1000;
setInterval(() => {
	try {
		window.world.update();
		window.world.draw();
	} catch (ex) {
		console.error(ex);
	}
}, TickTime);
