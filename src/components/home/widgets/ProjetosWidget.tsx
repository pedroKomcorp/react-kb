/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Spin, Input, Select } from 'antd';
import { getProjetos, getProjetoByID } from '../../../services/projetos';
import { getUsuarios } from '../../../services/usuarios';
import { getEtapasByProjeto } from '../../../services/etapas';
import ProjetoCarouselCard from './ProjetoCarouselCard';
import ProjetoDetailModal from '../../projetos/ProjetoDetailModal';
import EtapaDetailModal from '../../etapas/EtapaDetailModal';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';
import type { Etapa } from '../../../types/etapa';


const ProjetosWidget: React.FC = () => {
		const [projetos, setProjetos] = useState<Projeto[]>([]);
		const [usuarios, setUsuarios] = useState<Usuario[]>([]);
		const [loading, setLoading] = useState(true);
		const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
		const [loadingSelectedProjeto, setLoadingSelectedProjeto] = useState(false);
		const [selectedEtapa, setSelectedEtapa] = useState<Etapa | null>(null);
		const carouselRef = useRef<HTMLDivElement>(null);
		const [canScrollLeft, setCanScrollLeft] = useState(false);
		const [canScrollRight, setCanScrollRight] = useState(false);
		const [cardWidth, setCardWidth] = useState(180); 
		const [nome, setNome] = useState('');
		const [status, setStatus] = useState('');
		const [categoria, setCategoria] = useState('');
		const [prioridade, setPrioridade] = useState('');

		useEffect(() => {
			async function fetchData() {
					setLoading(true);
					try {
							const [{ projetos: allProjetos }, allUsuarios] = await Promise.all([
									getProjetos(),
									getUsuarios(),
							]);
							setUsuarios(allUsuarios);
							const userId = Number(localStorage.getItem('user_id'));
							

							const filtered = allProjetos.filter(p =>
									p.responsavel_id === userId ||
									(p.anexados && p.anexados.some(anexado => anexado.id === userId))
							);
							setProjetos(filtered);

					} finally {
							setLoading(false);
					}
			}
			fetchData();
	}, []);

	// Function to handle project selection and fetch detailed data
	const handleProjetoSelection = async (projeto: Projeto) => {
		setLoadingSelectedProjeto(true);
		try {
			// Get token for authentication
			const token = localStorage.getItem('token');
			
			// Fetch both project details and its etapas in parallel
			const [detailedProjeto, etapas] = await Promise.all([
				getProjetoByID(projeto.id, token || undefined),
				getEtapasByProjeto(projeto.id)
			]);
			
			
			// Combine the project with its etapas
			const projetoWithEtapas = {
				...detailedProjeto,
				etapas: etapas
			};
			
			setSelectedProjeto(projetoWithEtapas);
		} catch (error) {
			console.error('Error fetching project details:', error);
			// Fallback to the basic project data if detailed fetch fails
			setSelectedProjeto(projeto);
		} finally {
			setLoadingSelectedProjeto(false);
		}
	};

		// Enhanced responsive card size calculation
		useLayoutEffect(() => {
			function updateCardSize() {
				if (carouselRef.current) {
					const containerWidth = carouselRef.current.offsetWidth;
					let desiredVisibleCards = 4; // Default visible cards
					let cardMinWidth = 160; // Minimum card width
					
					// Adjust visible cards and minimum width based on container width
					if (containerWidth < 400) {
						desiredVisibleCards = 1.5; // Mobile: show 1 card with hint of next
						cardMinWidth = 140;
					} else if (containerWidth < 600) {
						desiredVisibleCards = 2.3; // Small tablet: show 2 cards with hint
						cardMinWidth = 150;
					} else if (containerWidth < 800) {
						desiredVisibleCards = 3.2; // Tablet: show 3 cards with hint
						cardMinWidth = 160;
					} else if (containerWidth < 1000) {
						desiredVisibleCards = 3.5; // Small desktop: show 3+ cards
						cardMinWidth = 180;
					} else if (containerWidth < 1200) {
						desiredVisibleCards = 4.2; // Medium desktop: show 4+ cards
						cardMinWidth = 200;
					} else {
						desiredVisibleCards = 4.5; // Large desktop: show 4+ cards
						cardMinWidth = 220;
					}
					
					// Calculate optimal card width considering gaps
					const gapSize = 12; // Space between cards
					const totalGapSpace = gapSize * (desiredVisibleCards - 1);
					const availableCardSpace = containerWidth - totalGapSpace;
					const calculatedWidth = availableCardSpace / desiredVisibleCards;
					
					const newCardWidth = Math.max(cardMinWidth, Math.min(280, calculatedWidth));
					setCardWidth(newCardWidth);
				}
			}
			window.addEventListener('resize', updateCardSize);
			updateCardSize(); // Initial calculation
			return () => window.removeEventListener('resize', updateCardSize);
		}, [projetos]);

		// Opções de filtro
		const statusOptions = [
			{ value: '', label: 'Todos' },
			{ value: 'EA', label: 'Em Andamento' },
			{ value: 'NI', label: 'Não Iniciado' },
			{ value: 'C', label: 'Concluído' },
			{ value: 'P', label: 'Pausado' },
		];
		const categoriaOptions = [
			{ value: '', label: 'Todas' },
			{ value: 'DV', label: 'Desenvolvimento' },
			{ value: 'MK', label: 'Marketing' },
			{ value: 'OT', label: 'Outros' },
		];
		const prioridadeOptions = [
			{ value: '', label: 'Todas' },
			{ value: 'UT', label: 'Urgente' },
			{ value: 'AL', label: 'Alta' },
			{ value: 'MD', label: 'Média' },
			{ value: 'BA', label: 'Baixa' },
		];

		const projetosFiltrados = projetos.filter(p =>
				(nome === '' || p.nome.toLowerCase().includes(nome.toLowerCase())) &&
				(status === '' || p.status === status) &&
				(categoria === '' || p.categoria === categoria) &&
				(prioridade === '' || p.prioridade === prioridade)
			);

			// Atualiza estado dos botões de scroll
			function updateScrollButtons() {
				const el = carouselRef.current;
				if (!el) return;
				setCanScrollLeft(el.scrollLeft > 0);
				setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 2);
			}
			useEffect(() => {
				updateScrollButtons();
				const el = carouselRef.current;
				if (!el) return;
				el.addEventListener('scroll', updateScrollButtons);
				window.addEventListener('resize', updateScrollButtons);
				return () => {
					if (el) {
						el.removeEventListener('scroll', updateScrollButtons);
					}
					window.removeEventListener('resize', updateScrollButtons);
				};
			}, [projetosFiltrados.length, cardWidth]);

		return (
			<div className="w-full h-full overflow-hidden flex flex-col" style={{ padding: 0 }}>
				<div className="flex flex-wrap gap-2 mb-3 items-center flex-shrink-0 px-2">
					<Input
						size="small"
						placeholder="Nome"
						value={nome}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
						className="min-w-[120px] flex-1"
					/>
					<Select
						size="small"
						value={status}
						onChange={setStatus}
						options={statusOptions}
						className="min-w-[100px]"
					/>
					<Select
						size="small"
						value={categoria}
						onChange={setCategoria}
						options={categoriaOptions}
						className="min-w-[100px]"
					/>
					<Select
						size="small"
						value={prioridade}
						onChange={setPrioridade}
						options={prioridadeOptions}
						className="min-w-[100px]"
					/>
				</div>
								{loading ? <Spin /> : (
								<div className="relative w-full flex-1 flex items-center overflow-hidden min-h-0">
										<button
											type="button"
											className="widget-scroll-button absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-100 border border-gray-300 rounded-full p-1 shadow transition disabled:opacity-30 flex items-center justify-center"
											style={{ display: projetosFiltrados.length > 0 ? 'flex' : 'none' }}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: -30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselLeftInterval = interval;
											}}
											onMouseUp={() => { clearInterval((window as any)._carouselLeftInterval); }}
											onMouseLeave={() => { clearInterval((window as any)._carouselLeftInterval); }}
											onTouchStart={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: -30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselLeftInterval = interval;
											}}
											onTouchEnd={() => { clearInterval((window as any)._carouselLeftInterval); }}
											tabIndex={-1}
											aria-label="Scroll left"
											disabled={!canScrollLeft}
										>
											&#8592;
										</button>
													<div
														ref={carouselRef}
														id="projetos-carousel"
														className="flex items-stretch flex-row gap-3 overflow-x-auto custom-scrollbar w-full h-full px-2 py-1"
														style={{ 
															scrollBehavior: 'smooth', 
															minHeight: 0, 
															minWidth: 0, 
															maxWidth: '100%', 
															maxHeight: '100%',
															scrollSnapType: 'x mandatory'
														}}
													>
														{projetosFiltrados.length === 0 ? (
															<div className="w-full flex items-center justify-center text-gray-500 text-sm">
																Nenhum projeto encontrado.
															</div>
														) : (
															projetosFiltrados.map(projeto => (
																<div 
																	key={projeto.id} 
																	className="flex-shrink-0 pl-6 pr-6" 
																	style={{ 
																		width: `${cardWidth}px`,
																		minWidth: `${cardWidth}px`,
																		maxWidth: `${cardWidth}px`,
																		scrollSnapAlign: 'start'
																	}}
																>
																	<ProjetoCarouselCard
																		projeto={projeto}
																		usuarios={usuarios}
																		onClick={() => handleProjetoSelection(projeto)}
																	/>
																</div>
															))
														)}
													</div>
										<button
											type="button"
											className="widget-scroll-button absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-100 border border-gray-300 rounded-full p-1 shadow transition disabled:opacity-30 flex items-center justify-center"
											style={{ display: projetosFiltrados.length > 0 ? 'flex' : 'none' }}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: 30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselRightInterval = interval;
											}}
											onMouseUp={() => { clearInterval((window as any)._carouselRightInterval); }}
											onMouseLeave={() => { clearInterval((window as any)._carouselRightInterval); }}
											onTouchStart={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
													el.scrollBy({ left: 30, behavior: 'auto' });
												}, 16);
												(window as any)._carouselRightInterval = interval;
											}}
											onTouchEnd={() => { clearInterval((window as any)._carouselRightInterval); }}
											tabIndex={-1}
											aria-label="Scroll right"
											disabled={!canScrollRight}
										>
											&#8594;
										</button>
									</div>
								)}
				<ProjetoDetailModal
					projeto={selectedProjeto}
					usuarios={usuarios}
					open={!!selectedProjeto || loadingSelectedProjeto}
					loading={loadingSelectedProjeto}
					canEditProjeto={false}
					canEditEtapa={false}
					canAddEtapa={false}
					canAddCredito={false}
					onClose={() => setSelectedProjeto(null)}
					onAddEtapa={() => {}}
					onSelectEtapa={(etapa) => setSelectedEtapa(etapa)}
					onUpdateProjeto={() => {}}
					onUpdateEtapa={() => {}}
					onDeleteEtapa={() => {}}
				/>
				<EtapaDetailModal
					etapa={selectedEtapa}
					usuarios={usuarios}
					open={!!selectedEtapa}
					onClose={() => setSelectedEtapa(null)}
				/>
			</div>
		);
	};


export default ProjetosWidget;
