import useEmblaCarousel from "embla-carousel-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./MovieCarousel.module.scss";

export default function MovieCarousel({ slides, options, title = "Featured Movies!" }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  return (
    <div className={styles.carouselWrapper}>
      <h2 className={styles.carouselTitle}>{title}</h2>
      <section className={styles.embla}>
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className={styles.emblaButton}
          aria-label="Previous"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {slides.map((movie, idx) => (
              <div className={styles.emblaSlide} key={movie.title}>
                <img src={movie.poster} alt={movie.title} className={styles.emblaImage} />
                <h3 className={styles.emblaTitle}>{`${idx + 1}: ${movie.title}`}</h3>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => emblaApi?.scrollNext()}
          className={styles.emblaButton}
          aria-label="Next"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </section>
    </div>
  );
}
