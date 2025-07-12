const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

console.log("=== UUID 테스트 ===");
const testUuid = uuidv4();
console.log("생성된 UUID:", testUuid);

console.log("\n=== Sharp 테스트 ===");
console.log("Sharp 버전:", sharp.versions);

// 간단한 이미지 정보 생성 테스트
sharp({
  create: {
    width: 100,
    height: 100,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 1 }
  }
})
.png()
.toBuffer()
.then(data => {
  console.log("Sharp 이미지 생성 성공! 버퍼 크기:", data.length, "bytes");
})
.catch(err => {
  console.error("Sharp 오류:", err.message);
});

console.log("\n=== 패키지 테스트 완료 ===");
