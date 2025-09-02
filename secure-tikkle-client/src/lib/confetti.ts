import confetti from 'canvas-confetti';

export async function partyBurst(){

    // 중앙
    confetti({
        particleCount: 120,
        spread: 70,
        origin: {y:0.6},
    });

    // 좌우
    confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x:0, y:0.7 },
    });

    confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7},
    });
}