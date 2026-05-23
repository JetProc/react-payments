import {useEffect, useState} from 'react';

import {deleteCard, getCards} from '@/api/cardsApi';
import {useAsyncRequest} from '@/common/hooks/useAsyncRequest';

const LOAD_CARDS_ERROR_MESSAGE = '카드 목록을 불러오지 못했습니다.';
const DELETE_CARD_ERROR_MESSAGE = '카드 삭제에 실패했습니다.';

export const useCards = () => {
  const {state, run: fetchCards, setError} = useAsyncRequest({
    request: getCards,
    errorMessage: LOAD_CARDS_ERROR_MESSAGE,
  });
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // 삭제 확인 후 서버 카드 삭제
  const removeCard = async (id: string) => {
    if (deletingCardId === id) return;

    const isConfirmed = window.confirm('카드를 삭제할까요?');

    if (!isConfirmed) return;

    setDeletingCardId(id);

    try {
      await deleteCard(id);
      await fetchCards();
    } catch {
      setError(DELETE_CARD_ERROR_MESSAGE);
    } finally {
      setDeletingCardId(null);
    }
  };

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  return {
    state,
    deletingCardId,
    refetch: fetchCards,
    removeCard,
  };
};
