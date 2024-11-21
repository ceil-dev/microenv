import { microEnv } from '.';

const run = async () => {
  // Create a new microEnv instance
  const myEnv = microEnv(
    {
      propA: 1,
      propB: 'two',
      propC: (payload, caller) => {
        return { message: `Hello ${payload}`, caller };
      },
    },
    { id: 'myEnv' }
  );

  // This will log the initial value of propA
  console.log('myEnv propA value:', myEnv.get('propA'));

  // Awaiting the future value of propB by using flag `next: true`
  (async () => {
    console.log(
      'myEnv new propB value:',
      await myEnv.get('propB', 'someCallerId', true)
    );
  })().catch(console.warn);

  // Log initial value of propC (the log will be called before the propB value)
  console.log('myEnv propC call result:', myEnv.face.propC('World'));

  // Update propB value
  setTimeout(() => {
    myEnv.face.propB = 68;
  }, 2000);
};

run().catch(console.warn);
