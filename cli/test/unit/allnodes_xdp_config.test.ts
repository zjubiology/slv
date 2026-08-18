import { assertEquals, assertThrows } from '@std/assert'
import {
  validateXdpConfig,
  type XdpConfig,
} from '/src/validator/init/promptXdpConfig.ts'

const zeroCopy: XdpConfig = {
  xdp_enabled: true,
  xdp_interface: 'synthetic-iface',
  xdp_cpu_cores: 4,
  xdp_zero_copy: true,
  xdp_poh_pinned_cpu_core: 4,
}

Deno.test('allnodes-jito zero-copy accepts explicit disjoint mainnet config', () => {
  assertEquals(
    validateXdpConfig('allnodes-jito', 'mainnet', zeroCopy),
    zeroCopy,
  )
})

Deno.test('allnodes-jito zero-copy rejects testnet before persistence', () => {
  assertThrows(
    () => validateXdpConfig('allnodes-jito', 'testnet', zeroCopy),
    Error,
    'mainnet',
  )
})

Deno.test('zero-copy requires interface, CPU allocation, and disjoint PoH CPU', () => {
  for (
    const config of [
      { ...zeroCopy, xdp_interface: '' },
      { ...zeroCopy, xdp_cpu_cores: 0 },
      { ...zeroCopy, xdp_poh_pinned_cpu_core: 3 },
    ]
  ) {
    assertThrows(
      () => validateXdpConfig('allnodes-jito', 'mainnet', config),
      Error,
    )
  }
})

Deno.test('non-zero-copy testnet configuration remains unchanged', () => {
  const config: XdpConfig = { xdp_enabled: false }
  assertEquals(validateXdpConfig('allnodes-jito', 'testnet', config), config)
})

Deno.test('existing jito zero-copy scope remains unchanged', () => {
  assertEquals(validateXdpConfig('jito', 'testnet', zeroCopy), zeroCopy)
})

Deno.test('existing agave zero-copy scope remains unchanged', () => {
  const incomplete: XdpConfig = { xdp_zero_copy: true }
  assertEquals(validateXdpConfig('agave', 'testnet', incomplete), incomplete)
})
