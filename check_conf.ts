import Conf from 'conf';
console.log(typeof Conf);
try {
    const c = new Conf({ projectName: 'test' });
    console.log('Constructor works');
} catch (e) {
    console.log('Constructor fails:', e);
}
