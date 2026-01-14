/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Spin, Input, Select, message } from 'antd';
import { getProjetos, getProjetoByID, updateProjeto } from '../../../services/projetos';
import { getUsuarios } from '../../../services/usuarios';
import { getEtapasByProjeto, createEtapa, updateEtapa, deleteEtapa } from '../../../services/etapas';
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
		const containerRef = useRef<HTMLDivElement>(null);
		const [canScrollLeft, setCanScrollLeft] = useState(false);
		const [canScrollRight, setCanScrollRight] = useState(false);
		const [cardWidth, setCardWidth] = useState(180);
		const [cardHeight, setCardHeight] = useState(160);
		const [numRows, setNumRows] = useState(1);
		const [nome, setNome] = useState('');
		const [status, setStatus] = useState<string[]>([]);
		const [categoria, setCategoria] = useState<string[]>([]);
		const [prioridade, setPrioridade] = useState<string[]>([]);

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
						
						// Load etapas for all filtered projects
						const projetosWithEtapas = await Promise.all(
							filtered.map(async (projeto) => {
								try {
									const etapas = await getEtapasByProjeto(projeto.id);
									return { ...projeto, etapas };
								} catch (error) {
									console.error(`Error loading etapas for project ${projeto.id}:`, error);
									return { ...projeto, etapas: [] };
								}
							})
						);
						
						setProjetos(projetosWithEtapas);

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
					const numProjects = projetosFiltrados.length;
					
					let desiredVisibleCards = 4; // Default visible cards
					let cardMinWidth = 160; // Minimum card width
					let cardMaxWidth = 320; // Maximum card width
					
					// If we have fewer projects than default visible, adjust to show all
					if (numProjects > 0 && numProjects < desiredVisibleCards) {
						desiredVisibleCards = numProjects;
						cardMaxWidth = 400; // Allow larger cards when fewer projects
					}
					
					// Adjust visible cards and minimum width based on container width
					if (containerWidth < 400) {
						desiredVisibleCards = Math.min(1.5, numProjects); // Mobile: show 1 card with hint of next
						cardMinWidth = 140;
						cardMaxWidth = 280;
					} else if (containerWidth < 600) {
						desiredVisibleCards = Math.min(2.3, numProjects); // Small tablet: show 2 cards with hint
						cardMinWidth = 150;
						cardMaxWidth = 300;
					} else if (containerWidth < 800) {
						desiredVisibleCards = Math.min(3.2, numProjects); // Tablet: show 3 cards with hint
						cardMinWidth = 160;
						cardMaxWidth = 320;
					} else if (containerWidth < 1000) {
						desiredVisibleCards = Math.min(3.5, numProjects); // Small desktop: show 3+ cards
						cardMinWidth = 180;
						cardMaxWidth = 350;
					} else if (containerWidth < 1200) {
						desiredVisibleCards = Math.min(4.2, numProjects); // Medium desktop: show 4+ cards
						cardMinWidth = 200;
						cardMaxWidth = 380;
					} else {
						desiredVisibleCards = Math.min(4.5, numProjects); // Large desktop: show 4+ cards
						cardMinWidth = 220;
						cardMaxWidth = 400;
					}
					
					// Calculate optimal card width considering gaps
					const gapSize = 12; // Space between cards
					const totalGapSpace = gapSize * (desiredVisibleCards - 1);
					const availableCardSpace = containerWidth - totalGapSpace - 48; // 48px for padding
					const calculatedWidth = availableCardSpace / desiredVisibleCards;
					
					const newCardWidth = Math.max(cardMinWidth, Math.min(cardMaxWidth, calculatedWidth));
					setCardWidth(newCardWidth);
				}
				
				// Calculate card height to fill container
				if (containerRef.current) {
					const containerHeight = containerRef.current.offsetHeight;
					const minCardHeight = 140;
					
					// Always use 1 row and scale height to fill container
					const availableHeight = containerHeight - 20; // Some padding
					const newCardHeight = Math.max(minCardHeight, availableHeight);
					
					setNumRows(1);
					setCardHeight(newCardHeight);
				}
			}
			window.addEventListener('resize', updateCardSize);
			updateCardSize(); // Initial calculation
			
			// Also observe container size changes (for grid resize)
			const resizeObserver = new ResizeObserver(() => {
				updateCardSize();
			});
			if (containerRef.current) {
				resizeObserver.observe(containerRef.current);
			}
			if (carouselRef.current) {
				resizeObserver.observe(carouselRef.current);
			}
			
			return () => {
				window.removeEventListener('resize', updateCardSize);
				resizeObserver.disconnect();
			};
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
			{ value: 'CP', label: 'Compensação' },
			{ value: 'RC', label: 'Recuperação de Crédito' },
			{ value: 'AO', label: 'Análise de Oportunidade' },
			{ value: 'AU', label: 'Auditoria' },
			{ value: 'CM', label: 'Comparativo' },
			{ value: 'PL', label: 'Planejamento' },
			{ value: 'CO', label: 'Consultoria' },
			{ value: 'ES', label: 'Escrituração' },
			{ value: 'RA', label: 'Radar' },
			{ value: 'ST', label: 'Solicitação TTD' },
			{ value: 'OT', label: 'Outro' },
		];
		const prioridadeOptions = [
			{ value: '', label: 'Todas' },
			{ value: 'UT', label: 'Urgente' },
			{ value: 'AL', label: 'Alta' },
			{ value: 'MD', label: 'Média' },
			{ value: 'BA', label: 'Baixa' },
		];

		const projetosFiltrados = projetos
			.filter(p =>
				(nome === '' || p.nome.toLowerCase().includes(nome.toLowerCase())) &&
				(status.length === 0 || status.includes(p.status)) &&
				(categoria.length === 0 || categoria.includes(p.categoria)) &&
				(prioridade.length === 0 || prioridade.includes(p.prioridade))
			)
			;

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
				{/* Enhanced Filter Section */}
				<div className="flex-shrink-0 px-3 py-3" style={{ backgroundColor: 'transparent' }}>
					<style>{`
						.filter-input-dark::placeholder {
							color: #4B5563 !important;
							opacity: 1 !important;
						}
						.ant-select-selection-placeholder {
							color: #4B5563 !important;
							opacity: 1 !important;
						}
					`}</style>
					<div className="flex flex-wrap gap-3 items-center">
						<Input
							size="large"
							placeholder="🔍 Buscar projeto..."
							value={nome}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
							className="flex-1 min-w-[180px] max-w-[300px] filter-input-dark"
							style={{ 
								borderRadius: '8px',
								borderColor: '#BA8364',
								borderWidth: '2px',
								backgroundColor: 'white',
								fontSize: '14px'
							}}
							allowClear
						/>
						<Select
							mode="multiple"
							size="large"
							value={status}
							onChange={setStatus}
							options={statusOptions}
							className="min-w-[140px]"
							style={{ 
								borderRadius: '8px',
								fontSize: '14px',
								backgroundColor: 'white'
							}}
							showArrow
							allowClear
							placeholder="📊 Status"
							maxTagCount={0}
							maxTagPlaceholder={(omittedValues) => (
								<span className="text-xs font-medium" style={{ color: '#BA8364' }}>
									{omittedValues.length} selecionado(s)
								</span>
							)}
						/>
						<Select
							mode="multiple"
							size="large"
							value={categoria}
							onChange={setCategoria}
							options={categoriaOptions}
							className="min-w-[140px]"
							style={{ 
								borderRadius: '8px',
								fontSize: '14px',
								backgroundColor: 'white'
							}}
							showArrow
							allowClear
							placeholder="📁 Categoria"
							maxTagCount={0}
							maxTagPlaceholder={(omittedValues) => (
								<span className="text-xs font-medium" style={{ color: '#BA8364' }}>
									{omittedValues.length} selecionada(s)
								</span>
							)}
						/>
						<Select
							mode="multiple"
							size="large"
							value={prioridade}
							onChange={setPrioridade}
							options={prioridadeOptions}
							className="min-w-[140px]"
							style={{ 
								borderRadius: '8px',
								fontSize: '14px',
								backgroundColor: 'white'
							}}
							showArrow
							allowClear
							placeholder="⚡ Prioridade"
							maxTagCount={0}
							maxTagPlaceholder={(omittedValues) => (
								<span className="text-xs font-medium" style={{ color: '#BA8364' }}>
									{omittedValues.length} selecionada(s)
								</span>
							)}
						/>
						{/* Results counter */}
						<div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(186, 131, 100, 0.1)', borderColor: '#BA8364', borderWidth: '1px', borderStyle: 'solid' }}>
							<span className="text-xs font-semibold" style={{ color: '#BA8364' }}>
								{projetosFiltrados.length} {projetosFiltrados.length === 1 ? 'projeto' : 'projetos'}
							</span>
						</div>
					</div>
				</div>
								{loading ? <Spin /> : (
								<div ref={containerRef} className="relative w-full flex-1 flex items-center overflow-hidden min-h-0">
										<button
											type="button"
												className="widget-scroll-button absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white border-2 rounded-full p-2 shadow-lg transition disabled:opacity-30 flex items-center justify-center"
												style={{ 
													display: projetosFiltrados.length > 0 ? 'flex' : 'none', 
													width: '36px', 
													height: '36px',
													backgroundColor: '#BA8364',
													borderColor: '#8B6347'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9A6B4F'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BA8364'}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: -cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
														el.scrollBy({ left: -15, behavior: 'smooth' });
													}, 50);
													(window as any)._carouselLeftInterval = interval;
												}}
												onMouseUp={() => { clearInterval((window as any)._carouselLeftInterval); }}
												onMouseLeave={() => { clearInterval((window as any)._carouselLeftInterval); }}
												onTouchStart={() => {
													const el = carouselRef.current;
													if (!el) return;
													const interval = setInterval(() => {
														el.scrollBy({ left: -15, behavior: 'smooth' });
													}, 50);
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
															className="overflow-x-auto custom-scrollbar w-full h-full flex items-center"
															style={{ 
																scrollBehavior: 'smooth', 
																minHeight: 0, 
																minWidth: 0, 
																maxWidth: '100%', 
																maxHeight: '100%',
																scrollSnapType: 'none',
																paddingLeft: '60px',
																paddingRight: '60px',
																paddingTop: '8px',
																paddingBottom: '8px'
														}}
													>
														{projetosFiltrados.length === 0 ? (
															<div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
																Nenhum projeto encontrado.
															</div>
														) : (
															<div 
																className="grid gap-3 mx-auto"
																style={{
																	gridTemplateRows: `repeat(${numRows}, ${cardHeight}px)`,
																	gridAutoFlow: 'column',
																	gridAutoColumns: `${cardWidth}px`,
																	width: projetosFiltrados.length <= 4 ? 'fit-content' : 'max-content',
																	minHeight: '100%',
																}}
															>
																{projetosFiltrados.map(projeto => (
																	<div 
																		key={projeto.id} 
																		className="flex-shrink-0" 
																		style={{ 
																			width: `${cardWidth}px`,
																			height: `${cardHeight}px`,
																			scrollSnapAlign: 'start'
																		}}
																	>
																		<ProjetoCarouselCard
																			projeto={projeto}
																			usuarios={usuarios}
																			onClick={() => handleProjetoSelection(projeto)}
																			onUpdate={(updatedProjeto) => {
																				setProjetos(prev => prev.map(p => 
																					p.id === updatedProjeto.id ? updatedProjeto : p
																				));
																			}}
																		/>
																	</div>
																))}
															</div>
														)}
													</div>
										<button
											type="button"
												className="widget-scroll-button absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white border-2 rounded-full p-2 shadow-lg transition disabled:opacity-30 flex items-center justify-center"
												style={{ 
													display: projetosFiltrados.length > 0 ? 'flex' : 'none', 
													width: '36px', 
													height: '36px',
													backgroundColor: '#BA8364',
													borderColor: '#8B6347'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9A6B4F'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#BA8364'}
											onClick={() => {
												const el = carouselRef.current;
												if (el) el.scrollBy({ left: cardWidth, behavior: 'smooth' });
											}}
											onMouseDown={() => {
												const el = carouselRef.current;
												if (!el) return;
												const interval = setInterval(() => {
														el.scrollBy({ left: 15, behavior: 'smooth' });
													}, 50);
													(window as any)._carouselRightInterval = interval;
												}}
												onMouseUp={() => { clearInterval((window as any)._carouselRightInterval); }}
												onMouseLeave={() => { clearInterval((window as any)._carouselRightInterval); }}
												onTouchStart={() => {
													const el = carouselRef.current;
													if (!el) return;
													const interval = setInterval(() => {
														el.scrollBy({ left: 15, behavior: 'smooth' });
													}, 50);
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
					canEditProjeto={true}
					canEditEtapa={true}
					canAddEtapa={true}
					canAddCredito={true}
					onClose={() => setSelectedProjeto(null)}
					onAddEtapa={async (etapaData) => {
						try {
							await createEtapa(etapaData as Omit<Etapa, 'id' | 'created_at'>);
							message.success('Etapa criada com sucesso!');
							if (selectedProjeto) {
								const token = localStorage.getItem('token');
								const [updatedProjeto, etapas] = await Promise.all([
									getProjetoByID(selectedProjeto.id, token || undefined),
									getEtapasByProjeto(selectedProjeto.id)
								]);
								const projetoAtualizado = { ...updatedProjeto, etapas };
								setSelectedProjeto(projetoAtualizado);
								setProjetos(prev => prev.map(p => p.id === projetoAtualizado.id ? projetoAtualizado : p));
							}
						} catch (error) {
							console.error('Erro ao criar etapa:', error);
							message.error('Erro ao criar etapa');
						}
					}}
					onSelectEtapa={(etapa) => setSelectedEtapa(etapa)}
					onUpdateProjeto={async (projetoData) => {
						try {
							if (!selectedProjeto) return;
							const token = localStorage.getItem('token');
							const updated = await updateProjeto(selectedProjeto.id, projetoData, token || undefined);
							message.success('Projeto atualizado!');
							const etapas = await getEtapasByProjeto(selectedProjeto.id);
							const projetoAtualizado = { ...updated, etapas };
							setSelectedProjeto(projetoAtualizado);
							setProjetos(prev => prev.map(p => p.id === projetoAtualizado.id ? projetoAtualizado : p));
						} catch (error) {
							console.error('Erro ao atualizar projeto:', error);
							message.error('Erro ao atualizar projeto');
						}
					}}
					onUpdateEtapa={async (etapaData) => {
						try {
							await updateEtapa(etapaData.id, etapaData);
							message.success('Etapa atualizada!');
							if (selectedProjeto) {
								const token = localStorage.getItem('token');
								const [updatedProjeto, etapas] = await Promise.all([
									getProjetoByID(selectedProjeto.id, token || undefined),
									getEtapasByProjeto(selectedProjeto.id)
								]);
								const projetoAtualizado = { ...updatedProjeto, etapas };
								setSelectedProjeto(projetoAtualizado);
								setProjetos(prev => prev.map(p => p.id === projetoAtualizado.id ? projetoAtualizado : p));
							}
						} catch (error) {
							console.error('Erro ao atualizar etapa:', error);
							message.error('Erro ao atualizar etapa');
						}
					}}
					onDeleteEtapa={async (etapaId) => {
						try {
							await deleteEtapa(etapaId);
							message.success('Etapa excluída!');
							if (selectedProjeto) {
								const token = localStorage.getItem('token');
								const [updatedProjeto, etapas] = await Promise.all([
									getProjetoByID(selectedProjeto.id, token || undefined),
									getEtapasByProjeto(selectedProjeto.id)
								]);
								const projetoAtualizado = { ...updatedProjeto, etapas };
								setSelectedProjeto(projetoAtualizado);
								setProjetos(prev => prev.map(p => p.id === projetoAtualizado.id ? projetoAtualizado : p));
							}
						} catch (error) {
							console.error('Erro ao excluir etapa:', error);
							message.error('Erro ao excluir etapa');
						}
					}}
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
