// Client half of the dsh-workbench bundle.
// Story 1.1 (tracer): register one minimal, side-effect-free marker so install,
// slot injection and disposal can be verified. The running-workspace pinning
// logic lands in later stories (see _bmad-output/initiative-workbench).
window.__ModuleLoader__.load({
  id: '@local/dsh-workbench',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    function WorkbenchMarker() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 12,
          height: 12,
          'aria-hidden': true,
          'data-dsh-workbench': 'tracer',
          style: { display: 'block' },
        },
        h('circle', { cx: 8, cy: 8, r: 6, fill: '#247bbf' }),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer.dock',
              id: 'dsh-workbench-marker',
              order: 90,
            },
            WorkbenchMarker,
          ),
        );
      },
    };
  },
});
