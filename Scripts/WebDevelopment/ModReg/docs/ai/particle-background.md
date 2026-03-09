# AI Rules for Particle Background System

This system provides a customizable canvas-based particle background.

## Usage Guidelines for AI

1.  **Integration**: Place the component as a background layer. It fills its parent container.
    ```tsx
    <div className="relative w-full h-screen">
      <ParticleBackgroundSystem particleCount={150} speed={0.5} />
      <div className="relative z-10">Content</div>
    </div>
    ```

2.  **Performance**: 
    - Keep `particleCount` below 500 for mobile devices.
    - Use `interactive={false}` if the background is purely decorative and doesn't need mouse response.

3.  **Styling**:
    - The component has a `bg-black/10` default background. You can wrap it in a div with a different background color if needed.
    - Ensure the parent has `overflow: hidden` to prevent canvas bleed.

## Parameters
- `particleCount`: (number) Total particles.
- `particleColor`: (string) Hex or CSS color.
- `speed`: (number) Velocity multiplier.
- `interactive`: (boolean) Mouse repulsion effect.
