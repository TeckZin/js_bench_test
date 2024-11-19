class Benchmark {
    constructor() {
        this.results = [];
    }

    async run(name, fn, iterations = 1000) {
        console.log("starting: ", name);

        // Force garbage collection if available (Node.js only)
        if (global.gc) {
            global.gc();
        }

        // Warm up run
        fn();

        const measurements = [];
        for (let i = 0; i < iterations; i++) {
            const startUsage = process.cpuUsage();
            const memBefore = process.memoryUsage();
            const start = performance.now();

            fn();

            const end = performance.now();
            const cpuUsage = process.cpuUsage(startUsage);
            const memAfter = process.memoryUsage();

            measurements.push({
                duration: end - start,
                memoryDelta: Math.max(0, memAfter.heapUsed - memBefore.heapUsed),
                cpuUser: cpuUsage.user,
                cpuSystem: cpuUsage.system
            });
        }

        // Calculate averages
        const avgDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / iterations;
        const avgMemory = measurements.reduce((sum, m) => sum + m.memoryDelta, 0) / iterations;
        const totalCpuTime = measurements.reduce((sum, m) => sum + m.cpuUser + m.cpuSystem, 0) / 1000000; // Convert to seconds

        this.results.push({
            name,
            totalTime: avgDuration * iterations,
            iterations,
            averageTime: avgDuration,
            memoryUsage: avgMemory,
            cpuUsage: totalCpuTime
        });

        console.log("done:", name);
        return this;
    }

    async compare(tests, iterations = 1000) {
        for (const [name, fn] of Object.entries(tests)) {
            await this.run(name, fn, iterations);
        }
        return this;
    }

    printResults() {
        console.table(this.results.map(result => ({
            'Test Name': result.name,
            'Total Time (ms)': result.totalTime.toFixed(3),
            'Iterations': result.iterations,
            'Avg Time (ms)': result.averageTime.toFixed(3),
            'Memory Usage (mb)': `${(result.memoryUsage / 1024 / 1024).toFixed(2)}`,
            'CPU Time (s)': result.cpuUsage.toFixed(3),
            'RAM to CPU ratio (mb/ms)': ((result.memoryUsage / 1024 / 1024).toFixed(2))
                / result.cpuUsage.toFixed(3),
        })));

        const fastest = this.results.reduce((prev, current) =>
            prev.averageTime < current.averageTime ? prev : current
        );

        console.log(`\nFastest test: ${fastest.name}`);
        this.results.forEach(result => {
            if (result !== fastest) {
                const ratio = (result.averageTime / fastest.averageTime).toFixed(2);
                console.log(`${result.name} is ${ratio}x slower than ${fastest.name}`);
            }
        });
    }

    clear() {
        this.results = [];
        return this;
    }
}



const fibi = (n) => {
    if (n <= 1) return n;
    return fibi(n - 1) + fibi(n - 2);
};

const sieve = (n) => {
    const arr = new Array(n + 1).fill(true);
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (arr[i]) {
            for (let j = i * i; j <= n; j += i) {
                arr[j] = false;
            }
        }
    }
    return arr.reduce((primes, isPrime, num) =>
        isPrime && num > 1 ? [...primes, num] : primes, []);
};

const multiply = (size) => {
    const A = Array(size).fill().map(() =>
        Array(size).fill().map(() => Math.random()));
    const B = Array(size).fill().map(() =>
        Array(size).fill().map(() => Math.random()));
    const C = Array(size).fill().map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return C;
};

const arrayop = (size) => {
    // Create large arrays
    const arr1 = new Array(size).fill(0).map(() => Math.random());
    const arr2 = new Array(size).fill(0).map(() => Math.random());

    // Array operations
    const multiplication = arr1.map((val, i) => val * arr2[i]);
    const sum = arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);

    // Filter and map operations
    const filtered = arr1.filter(val => val > 0.5);
    const transformed = filtered.map(val => val * val);
}


// Test function
const tests = {
    // 'fibonacci(30)': () => {
    //     fibi(30);
    // },
    'fibonacci(45)': () => {
        fibi(45);
    },
    // 'prime(1000)': () => {
    //     sieve(1000)
    // },
    // 'prime(10000)': () => {
    //     sieve(10000)
    // },
    'prime(1000000)': () => {
        sieve(1000000)
    },
    // 'matrix multiply(100)': () => {
    //     multiply(100)
    // },
    'matrix multiply(1000)': () => {
        multiply(1000)
    },
    // 'array operations(1_000_000)': () => {
    //     arrayop(1000000)
    // },
    'array operations(10_000_000)': () => {
        arrayop(10000000)
    }

};

const bench = new Benchmark();

await bench.compare(tests, 5)
bench.printResults();

