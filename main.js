class Benchmark {
    constructor() {
        this.results = [];
    }

    // Run a single test
    run(name, fn, iterations = 1000) {
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            fn();
        }

        const end = performance.now();
        const duration = end - start;
        const average = duration / iterations;

        this.results.push({
            name,
            totalTime: duration,
            iterations,
            averageTime: average
        });

        return this;
    }

    // Compare multiple functions
    compare(tests, iterations = 1000) {
        Object.entries(tests).forEach(([name, fn]) => {
            this.run(name, fn, iterations);
        });
        return this;
    }

    // Print results in a formatted table
    printResults() {
        console.table(this.results.map(result => ({
            'Test Name': result.name,
            'Total Time (ms)': result.totalTime.toFixed(3),
            'Iterations': result.iterations,
            'Avg Time (ms)': result.averageTime.toFixed(3)
        })));

        // Find fastest test
        const fastest = this.results.reduce((prev, current) =>
            prev.averageTime < current.averageTime ? prev : current
        );

        console.log(`\nFastest test: ${fastest.name}`);

        // Compare others to fastest
        this.results.forEach(result => {
            if (result !== fastest) {
                const ratio = (result.averageTime / fastest.averageTime).toFixed(2);
                console.log(`${result.name} is ${ratio}x slower than ${fastest.name}`);
            }
        });
    }

    // Clear results
    clear() {
        this.results = [];
        return this;
    }
}
// Create benchmark instance
const bench = new Benchmark();

// Define test functions
const tests = {
    // 'Array forEach': () => {
    //     const arr = Array(1000).fill(0);
    //     arr.forEach(x => Math.sqrt(x));
    // },
    // 'Array for...of': () => {
    //     const arr = Array(1000).fill(0);
    //     for (const x of arr) Math.sqrt(x);
    // },
    // 'Array for loop': () => {
    //     const arr = Array(1000).fill(0);
    //     for (let i = 0; i < arr.length; i++) Math.sqrt(arr[i]);
    // },
    //
    'fibonaci(35)': () => {
        const fn = (n) => {
            if (n <= 1) {
                return n
            }
            return fn(n - 1) + fn(n - 2)
        };
        fn(35)


    }

};

console.log(tests)

// Run comparison
bench.compare(tests, 100).printResults();
