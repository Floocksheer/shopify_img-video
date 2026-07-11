import { Input } from "lumora";

export function WithLabel() {
  return (
    <div className="w-72">
      <Input
        id="store-url"
        label="Store URL"
        placeholder="mystore.myshopify.com"
      />
    </div>
  );
}

export function Filled() {
  return (
    <div className="w-72">
      <Input
        id="product-name"
        label="Product name"
        defaultValue="Linen throw pillow — sage"
      />
    </div>
  );
}

export function Bare() {
  return (
    <div className="w-72">
      <Input placeholder="Search generations…" type="search" />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="w-72">
      <Input
        id="api-key"
        label="API key"
        placeholder="Available on the Pro plan"
        disabled
      />
    </div>
  );
}
