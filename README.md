# compute-nodes

> Create any logic or data transformation using visual nodes!


![Alt text](.github/images/node-example.png?raw=true "Compute Nodes")

## Install

```bash
npm install --save compute-nodes
```

## Usage

See examples/ to have a better idea of how to use this framework.
```bash
cd examples
npm start
```

In short, you need to define a resolver that will process the data from the nodes
and associate any data between the node connections.

## 1- Define and register some nodes:
```ts
class SomeNode extends CanvasNode {
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

## 2- Register your types
```tsx
// Create a NodeRegistry and register your types:
const nodeRegistry = new LocalNodeRegistry();

// Register type allow you to pass in some properties that are merged with the ones
// found in the class definition provided in the first argument
// This may be useful to override part of the behaviour of some node type
// Or in case you don't have the definition of some properties at compile time, for instance
nodeRegistry.registerType(SomeNode, {
    render: (props) => <SomeNodeVisualComponent {...props}/>, /*...others...*/});

```

## 3- Setup a node resolver and provide it to a canvas
```tsx
// Create your node resolver
const resolver = new LocalNodeResolver(nodeRegistry)

// And provide the resolver to a canvas component
function NodeGraphCanvas() {
  return <Canvas resolver={resolver}/>
}

```

## License

MIT © [MateusMP](https://github.com/MateusMP)
