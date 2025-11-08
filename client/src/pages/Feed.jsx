import TweetCard from "../components/TweetCard";
import { useTweets } from "../hooks/useTweets";
import { Loader2, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import NewTweetsBanner from "../components/NewTweetsBanner";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";

const wrapper = 
    "max-w-2xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 flex flex-col gap-4 pb-10";
const loader =
    "flex justify-center items-center h-[60vh] text-sky-400 animate-pulse";
const errorMsg =
    "text-center text-red-400 mt-16 font-medium text-lg select-none";
const searchWrapper =
    "sticky top-16 sm:top-20 z-30 bg-slate-900/80 backdrop-blur-md rounded-xl p-3 mb-4 border border-slate-700/50 shadow-lg";
const searchContainer = "relative";
const searchInput =
    "w-full bg-slate-800/50 text-slate-100 rounded-lg pl-10 pr-10 py-2 border border-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-500";
const searchIcon = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4";
const clearButton =
    "absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-md transition-colors";

export default function Feed() {
    const { data, isLoading, isError } = useTweets();
    const [newTweets, setNewTweets] = useState(0);
    const [searchUser, setSearchUser] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);
    const queryClient = useQueryClient();
    const sseRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchUser);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchUser]);

    // Filter tweets by search
    useEffect(() => {
        if (!data) return;
        
        if (!debouncedSearch.trim()) {
            setFilteredData(data);
            return;
        }

        const filtered = data.filter(tweet =>
            tweet.user.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        setFilteredData(filtered);
    }, [data, debouncedSearch]);

    // SSE connection with retry logic
    useEffect(() => {
        let retryCount = 0;
        const MAX_RETRIES = 5;
        const RETRY_DELAY = 3000;

        const connect = () => {
            if (sseRef.current) {
                sseRef.current.close();
            }

            const eventSource = new EventSource("/api/stream");
            sseRef.current = eventSource;

            eventSource.onopen = () => {
                console.log("✅ SSE connected");
                retryCount = 0;
            };

            eventSource.onmessage = (event) => {
                if (event.data === "connected") return;

                try {
                    const { type, count } = JSON.parse(event.data);
                    if (type === "new_tweets") {
                        console.log(`📢 ${count} new tweets available`);
                        setNewTweets((n) => n + count);
                    }
                } catch (err) {
                    console.error("SSE parse error:", err);
                }
            };

            eventSource.onerror = () => {
                console.error("❌ SSE disconnected");
                eventSource.close();

                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    console.log(`🔄 Retrying SSE connection (${retryCount}/${MAX_RETRIES})...`);
                    reconnectTimeoutRef.current = setTimeout(connect, RETRY_DELAY);
                } else {
                    console.error("❌ Max SSE retry attempts reached");
                }
            };
        };

        connect();

        return () => {
            if (sseRef.current) {
                sseRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        if (!observerTarget.current || isLoadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreTweets();
                }
            },
            { threshold: 1.0 }
        );

        observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [filteredData, isLoadingMore, hasMore]);

    const loadMoreTweets = useCallback(async () => {
        if (!filteredData.length || isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        // Artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const oldestTweet = filteredData[filteredData.length - 1];
            const res = await fetch(
                `/api/tweets?before=${encodeURIComponent(oldestTweet.createdAt)}&limit=10`
            );
            
            if (!res.ok) return;
            
            const olderTweets = await res.json();

            if (olderTweets.length === 0) {
                setHasMore(false);
                return;
            }

            queryClient.setQueryData(["tweets"], (old) => {
                if (!Array.isArray(old)) return olderTweets;
            
                // Deduplicate by _id
                const existingIds = new Set(old.map(t => t._id));
                const newUniqueTweets = olderTweets.filter(t => !existingIds.has(t._id));
            
                return [...old, ...newUniqueTweets];
            });

            console.log(`📜 Loaded ${olderTweets.length} older tweets`);
        } catch (err) {
            console.error("Load more error:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [filteredData, isLoadingMore, hasMore, queryClient]);

    const handleRefresh = async () => {
        if (!data || !data.length) return;

        // Artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 600));

        try {
            const res = await fetch("/api/tweets?limit=50");
            if (!res.ok) return;
            
            const latestTweets = await res.json();

            if (!Array.isArray(latestTweets) || latestTweets.length === 0) {
                setNewTweets(0);
                return;
            }

            // Sort by createdAt descending
            const sorted = latestTweets.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            queryClient.setQueryData(["tweets"], sorted);

            console.log(`✅ Refreshed with ${sorted.length} tweets`);
            setNewTweets(0);
        } catch(err) {
            console.error("Refresh error:", err);
        }
    };

    const clearSearch = () => {
        setSearchUser("");
    };

    if (isLoading)
        return (
            <div className={loader}>
                <Loader2 className="w-9 h-9 animate-spin" />
            </div>
        );

    if (isError)
        return <div className={errorMsg}>Failed to load tweets 😢</div>;

    return (
        <>
        <Header/>
        <section className={wrapper}>
            <NewTweetsBanner 
                visible={newTweets > 0}
                count={newTweets}
                onClick={handleRefresh}
            />

            <div className={searchWrapper}>
                <div className={searchContainer}>
                    <Search className={searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className={searchInput}
                    />
                    {searchUser && (
                        <button onClick={clearSearch} className={clearButton}>
                            <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        </button>
                    )}
                </div>
            </div>

            {filteredData.length === 0 && searchUser ? (
                <div className="text-center text-slate-400 mt-16">
                    No tweets found from "{searchUser}"
                </div>
            ) : (
                <>
                    {filteredData.map((tweet) => (
                        <TweetCard key={tweet._id} tweet={tweet} />
                    ))}
                </>
            )}

            {hasMore && filteredData.length > 0 && !searchUser && (
                <div ref={observerTarget}>
                    {isLoadingMore && <LoadingSpinner message="Loading more tweets..." />}
                </div>
            )}

            {!hasMore && filteredData.length > 0 && (
                <div className="text-center text-slate-500 text-sm py-8">
                    You've reached the end 🎉
                </div>
            )}
        </section>
        </>
    );
}