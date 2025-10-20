/**
 * Composable pour gérer l'état et les fonctionnalités du système de don
 */
export const useDonate = () => {
  const isDonateModalOpen = useState<boolean>('donate-modal-open', () => false)

  const openDonateModal = () => {
    isDonateModalOpen.value = true
  }

  const closeDonateModal = () => {
    isDonateModalOpen.value = false
  }

  return {
    isDonateModalOpen,
    openDonateModal,
    closeDonateModal,
  }
}
