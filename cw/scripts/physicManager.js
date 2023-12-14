import mapManager from "./mapManager.js";

class PhysicManager {
    update(obj) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return "stop";

        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2);

        if (ts === 0 || newX < -10 || newX > 900 || newY < -10 || newY > 900) {
            return "break";
        } else
            return "move";

    }
}

const physicManager = new PhysicManager();
export default physicManager;