# node-machine

> Create any logic or data transformation using visual nodes!

[![NPM](https://img.shields.io/npm/v/node-machine.svg)](https://www.npmjs.com/package/node-machine) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


![Alt text](.github/images/node-example.png?raw=true "Node Machine")

## Install

```bash
npm install --save node-machine
```

## Usage

See examples/ to have a better idea of how to use this framework.

In short, you need to define a resolver that will process the data from the nodes
and associate any data between the node connections.


## 1- Define and register some nodes:
```ts
class SomeNode : CanvasNode {
    data: {
      x,
      y,
      z
    }

    // Define some metadata
    // This can be defined anywhere, you will need to specify this later
    // Specify the input and output format
    static InputFormat = {
      in1: {
        type: "any",
        visualName: "Input 1"
      }
    };
    static OutputFormat = {
      out1: {
        type: "any",
        visualName: "Output 1"
      },
      anynamehere: {
        type: "any",
        visualName: "Output 2"
      }
    };

    // Provide a construct method:
    static Construct = (args) => {
      // Feel free to do any special initialization
      return new SomeNode(args);
    }

    // LocalResolve is just an example using a Local Node Resolver
    // You can implement any kind of resolver, that can use a backend
    // to generate some data, for instance.
    // @See example/src/resolver/LocalNodeResolver.ts
    static LocalResolve = (node, input) => {
      return {
        out1: input.in1 + 10,
        anynamehere: input.in1 * 10;
      }
    }
}
```

## 2- Register your types and define a resolver, and provide that to a canvas
```tsx
// Create a NodeRegistry and register your types:
const nodeRegistry = new LocalNodeRegistry();

// Register type allow you to pass in some properties that are merged with the ones
// found in the class definition provided in the first argument
// This may be useful to override part of the behaviour of some node type
// Or in case you don't have the definition of some properties at compile time, for instance
nodeRegistry.registerType(SomeNode, {
    render: (props) => <SomeNodeVisualComponent {...props}/>, /*...others...*/});


// Create your node resolver
const resolver = new LocalNodeResolver()

// And provide the resolver to a canvas component
function NodeGraphCanvas() {
  return <Canvas resolver={resolver}/>
}

```

## License

MIT © [MateusMP](https://github.com/MateusMP)
