import Phaser from 'phaser';
import { CONTAINER_UI_MAP } from '../data/ContainerRendererMap';

export default class LabScene extends Phaser.Scene {
  constructor() {
    super('LabScene');
  }

  preload() {
    // Không cần preload ảnh ngoài, tự sinh 100% bằng Graphics
  }

  create() {
    // Tự sinh texture cho ngọn lửa (Soft Circle) bằng WebGL Graphics
    if (!this.textures.exists('soft-fire')) {
      const g = this.make.graphics({x: 0, y: 0, add: false});
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 16);
      g.generateTexture('soft-fire', 32, 32);
    }

    // Tự sinh texture cho bong bóng khí
    if (!this.textures.exists('soft-bubble')) {
      const g = this.make.graphics({x: 0, y: 0, add: false});
      // Viền dày hơn một chút để dễ nhìn
      g.lineStyle(3, 0xffffff, 1);
      g.strokeCircle(16, 16, 13);
      // Màu trong suốt bên trong
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(16, 16, 13);
      // Điểm lóe sáng (specular highlight) góc trên bên trái
      g.fillStyle(0xffffff, 1);
      g.fillCircle(10, 10, 4);
      g.generateTexture('soft-bubble', 32, 32);
    }

    // Bật biên vô hình cho toàn màn hình
    this.matter.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    // Vẽ một đường lưới mờ mờ ở background (Dot grid pattern giống hệ thống cũ)
    const grid = this.add.graphics();
    grid.fillStyle(0x94a3b8, 0.4);
    for(let i = 25; i < this.sys.game.config.width; i += 50) {
      for(let j = 25; j < this.sys.game.config.height; j += 50) {
        grid.fillCircle(i, j, 3);
      }
    }

    // Khởi tạo lưu trữ bình chứa
    this.containers = {};
    this.events.on('UPDATE_CONTAINERS', this.handleUpdateContainers, this);

    // Thiết lập cầu nối sự kiện (React -> Phaser) qua Global Window Event
    this.handleGlobalSpawn = (e) => this.handleSpawnChemical(e.detail);
    window.addEventListener('PHASER_SPAWN', this.handleGlobalSpawn);

    // Lắng nghe lệnh hòa tan từ React
    this.handleDissolve = (e) => {
      const { chunkId, containerId, duration } = e.detail;
      let chunksToDissolve = [];
      
      if (chunkId) {
        const chunk = this.matter.world.getAllBodies().find(b => b.id === chunkId);
        if (chunk) chunksToDissolve.push(chunk);
      } else if (containerId) {
        const chunks = this.matter.world.getAllBodies().filter(b => b.label === 'chemicalChunk' && b.containerId === containerId);
        chunksToDissolve = chunks;
      }

      chunksToDissolve.forEach(chunk => {
        if (chunk && chunk.gameObject) {
          this.tweens.add({
            targets: chunk.gameObject,
            scaleX: 0,
            scaleY: 0,
            duration: duration || 3000,
            onComplete: () => {
              chunk.gameObject.destroy();
            }
          });
        }
      });
    };
    window.addEventListener('PHASER_DISSOLVE_CHUNK', this.handleDissolve);

    // PHASE 4: START PARTICLES (Sủi bọt / Lửa)
    this.handleStartParticles = (e) => {
      const { containerId, type, amount, molarity } = e.detail;
      const container = this.containers[containerId];
      if (!container) return;

      if (!container.emitters) container.emitters = [];

      // Tính toán tọa độ đáy nước và mặt nước
      const emitX = container.bottomWall.x;
      const liquidSensorY = container.liquidSensor.y;
      const emitY = liquidSensorY + 25; // Gần đáy
      const surfaceY = liquidSensorY - 35; // Mặt nước

      // Phase 4: Tính toán hệ số mãnh liệt (Intensity)
      const reactAmount = amount || 10;
      const reactMolarity = molarity || 1.0;
      // Intensity dao động từ 0.5x đến 3x
      const intensity = Math.min(Math.max((reactAmount / 20) * reactMolarity, 0.5), 3);

      if (type === 'bubbling' || type === 'violent') {
        const bubbleEmitter = this.add.particles(0, 0, 'soft-bubble', {
          x: { min: emitX - 25, max: emitX + 25 },
          y: emitY,
          lifespan: { min: 1000, max: 1500 },
          // Hạt bay nhanh hơn nếu intensity cao
          speedY: { min: -100 * intensity, max: -200 * intensity },
          speedX: { min: -15 * intensity, max: 15 * intensity },
          // Kích thước bong bóng to hơn 1 chút
          scale: { start: 0.5 * Math.max(intensity, 1), end: 1.2 * Math.max(intensity, 1) }, 
          alpha: { start: 0.8, end: 0 },
          // Tần suất sinh hạt (frequency nhỏ = sinh nhanh hơn)
          frequency: Math.max(50 / intensity, 15),
          blendMode: 'NORMAL' // Dùng NORMAL thay vì ADD để bong bóng nổi bật trên nền sáng
        });
        bubbleEmitter.setDepth(10);
        container.emitters.push(bubbleEmitter);
      }

      if (type === 'violent') {
        const fireEmitter = this.add.particles(0, 0, 'soft-fire', {
          x: { min: emitX - 15, max: emitX + 15 },
          y: surfaceY + 10,
          lifespan: { min: 400, max: 700 },
          speedY: { min: -50 * intensity, max: -120 * intensity },
          speedX: { min: -15 * intensity, max: 15 * intensity },
          scale: { start: 0.8 * intensity, end: 0.1 }, 
          alpha: { start: 1, end: 0 },
          tint: [ 0xfffb00, 0xff7300, 0xff0000, 0x444444 ], // Vàng sáng -> Cam -> Đỏ -> Khói đen
          frequency: Math.max(30 / intensity, 10), // Bùng lửa mạnh hơn
          blendMode: 'ADD' // Vì là chấm sáng trắng, trộn ADD sẽ tự động tạo độ glow như lửa thật!
        });
        fireEmitter.setDepth(15);
        container.emitters.push(fireEmitter);
      }
    };
    window.addEventListener('PHASER_START_PARTICLES', this.handleStartParticles);

    // PHASE 4: STOP PARTICLES
    this.handleStopParticles = (e) => {
      const { containerId } = e.detail;
      const container = this.containers[containerId];
      if (!container || !container.emitters) return;

      container.emitters.forEach(emitter => {
        emitter.stop(); // Ngừng sinh hạt mới, để các hạt cũ bay nốt (Tránh Memory Leak & Mất tự nhiên)
        setTimeout(() => {
          emitter.destroy(); // Hủy hẳn Emitter sau khi hạt bay xong
        }, 2500);
      });
      container.emitters = [];
    };
    window.addEventListener('PHASER_STOP_PARTICLES', this.handleStopParticles);

    // DỌN DẸP SỰ KIỆN KHI UNMOUNT HOẶC RESTART
    this.events.on('shutdown', () => {
      window.removeEventListener('PHASER_SPAWN', this.handleGlobalSpawn);
      window.removeEventListener('PHASER_DISSOLVE_CHUNK', this.handleDissolve);
      window.removeEventListener('PHASER_START_PARTICLES', this.handleStartParticles);
      window.removeEventListener('PHASER_STOP_PARTICLES', this.handleStopParticles);
    });
    this.events.on('destroy', () => {
      window.removeEventListener('PHASER_SPAWN', this.handleGlobalSpawn);
      window.removeEventListener('PHASER_DISSOLVE_CHUNK', this.handleDissolve);
      window.removeEventListener('PHASER_START_PARTICLES', this.handleStartParticles);
      window.removeEventListener('PHASER_STOP_PARTICLES', this.handleStopParticles);
    });

    // Lắng nghe va chạm (Collision)
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const sensor = bodyA.isSensor ? bodyA : (bodyB.isSensor ? bodyB : null);
        const chunk = bodyA.isSensor ? bodyB : (bodyB.isSensor ? bodyA : null);
        
        if (sensor && sensor.label === 'liquidSensor' && chunk && chunk.label === 'chemicalChunk' && !chunk.hasHitWater) {
          chunk.hasHitWater = true;
          chunk.containerId = sensor.containerId; // Lưu containerId để di chuyển theo bình
          
          window.dispatchEvent(new CustomEvent('PHASER_HIT_LIQUID', { 
            detail: { 
              containerId: sensor.containerId, 
              chemicalName: chunk.chemicalName,
              chunkId: chunk.id,
              amount: chunk.amount,
              molarity: chunk.molarity
            } 
          }));
        }
      });
    });
  }

  handleUpdateContainers(placedItems) {
    const currentIds = new Set();
    const containerClassMap = {
      beaker: { w: 96, h: 112 },
      test_tube: { w: 48, h: 128 }
    };

    placedItems.forEach(item => {
      if (item.templateId !== 'beaker' && item.templateId !== 'test_tube') return;
      currentIds.add(item.instanceId);

      const size = containerClassMap[item.templateId];
      if (!size) return;

      const cx = item.x + size.w / 2;
      const cy = item.y + size.h / 2;

      if (!this.containers[item.instanceId]) {
        // TẠO MỚI TƯỜNG VẬT LÝ
        // padY nhỏ hơn để đáy vật lý lọt thỏm xuống đường cong thủy tinh
        // padY nhỏ hơn để đáy vật lý lọt thỏm xuống đường cong thủy tinh
        const padX = item.templateId === 'test_tube' ? 12 : 11.5;
        const padY = item.templateId === 'test_tube' ? 0 : 0;
        const wallW = 20; // Giảm độ dày tường để các bình có thể đứng sát nhau
        const botH = 20;
        
        // Dùng Phaser GameObject (tàng hình) để dễ dàng setPosition sau này
        // Căn chỉnh sao cho mép trong của tường trùng với mép bình
        const leftWall = this.add.rectangle(item.x + padX - wallW/2, cy, wallW, size.h, 0xff0000, 0);
        this.matter.add.gameObject(leftWall, { isStatic: true });
        
        const rightWall = this.add.rectangle(item.x + size.w - padX + wallW/2, cy, wallW, size.h, 0xff0000, 0);
        this.matter.add.gameObject(rightWall, { isStatic: true });
        
        const bottomWall = this.add.rectangle(cx, item.y + size.h - padY + botH/2, size.w, botH, 0xff0000, 0);
        this.matter.add.gameObject(bottomWall, { isStatic: true });

        // VÙNG SENSOR CHẤT LỎNG (Chỉ dùng để phát hiện va chạm, không cản đường)
        const liquidH = size.h * 0.55; // Mặc định chất lỏng cao 55%
        const liquidSensor = this.add.rectangle(cx, item.y + size.h - padY - liquidH/2, size.w - 20, liquidH, 0x3b82f6, 0);
        this.matter.add.gameObject(liquidSensor, {
          isStatic: true,
          label: 'liquidSensor'
        });
        liquidSensor.setSensor(true); // FORCE SENSOR via Phaser method
        liquidSensor.body.isSensor = true; // FORCE SENSOR via Matter body
        liquidSensor.body.containerId = item.instanceId; // Lưu trữ ID bình chứa để báo về React

        this.containers[item.instanceId] = {
          leftWall, rightWall, bottomWall, liquidSensor, size
        };
      }

      // CẬP NHẬT VỊ TRÍ
      const container = this.containers[item.instanceId];
      const wallW = 20;
      const botH = 20;
      const padX = item.templateId === 'test_tube' ? 12 : 11.5;
      const padY = item.templateId === 'test_tube' ? 6 : 6;
      
      const oldCx = container.bottomWall.x;
      const oldCy = container.leftWall.y;
      const dx = cx - oldCx;
      const dy = cy - oldCy;
      
      container.leftWall.setPosition(item.x + padX - wallW/2, cy);
      container.rightWall.setPosition(item.x + size.w - padX + wallW/2, cy);
      container.bottomWall.setPosition(cx, item.y + size.h - padY + botH/2);
      
      const liquidH = size.h * 0.55;
      container.liquidSensor.setPosition(cx, item.y + size.h - padY - liquidH/2);
      
      // Di chuyển Emitters theo bình
      if ((dx !== 0 || dy !== 0) && container.emitters) {
        container.emitters.forEach(emitter => {
          emitter.setPosition(emitter.x + dx, emitter.y + dy);
        });
      }
      
      // Di chuyển các viên kim loại bên trong bình theo bình
      if (dx !== 0 || dy !== 0) {
        const chunks = this.matter.world.getAllBodies().filter(b => b.label === 'chemicalChunk' && b.containerId === item.instanceId);
        chunks.forEach(c => {
          this.matter.body.translate(c, { x: dx, y: dy });
        });
      }
    });

    // XÓA BÌNH NẾU USER XÓA TRÊN UI
    Object.keys(this.containers).forEach(id => {
      if (!currentIds.has(id)) {
        const c = this.containers[id];
        c.leftWall.destroy();
        c.rightWall.destroy();
        c.bottomWall.destroy();
        c.liquidSensor.destroy();
        delete this.containers[id];
      }
    });
  }

  handleSpawnChemical(data) {
    const { x, y, name, color, amount, molarity, containerTemplate } = data;
    
    // Ép kiểu an toàn, tránh NaN làm tàng hình object
    const validColor = (typeof color === 'number' && !isNaN(color)) ? color : 0x94a3b8;
    
    // Dynamic Solid Scale (Theo yêu cầu: không vượt quá 80% miệng bình)
    const containerConfig = CONTAINER_UI_MAP[containerTemplate || 'beaker'];
    const maxInnerWidth = containerConfig ? containerConfig.innerWidth : 70;
    const maxAllowedSize = maxInnerWidth * 0.8;
    
    // Hàm Scale: 1g -> 8px (min), 50g -> maxAllowedSize (Giả sử 50g là slider max)
    const mass = parseFloat(amount) || 10;
    let calculatedSize = 8 + (mass / 50) * (maxAllowedSize - 8);
    const finalSize = Math.min(Math.max(calculatedSize, 8), maxAllowedSize);
    
    const rect = this.add.rectangle(x, y, finalSize, finalSize, validColor);
    
    this.matter.add.gameObject(rect, {
      restitution: 0.6, // Tăng độ nảy lên để thấy rõ lộp bộp
      friction: 0.1,
      density: 0.05,
      label: 'chemicalChunk'
    });
    
    // Gắn metadata vào body để xử lý va chạm
    rect.body.chemicalName = name;
    rect.body.amount = amount;
    rect.body.molarity = molarity;
  }

  update() {
    // Game loop logic
  }
}
